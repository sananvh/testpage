import Anthropic from "@anthropic-ai/sdk";
import { locales, type Locale } from "@/i18n/config";
import { clientIp, rateLimit, readBody } from "@/lib/security";
import { get, run } from "@/lib/db";
import { basicReply } from "@/lib/assistant/basic";
import { buildKnowledge } from "@/lib/assistant/knowledge";
import { runTool, systemPrompt, TOOLS, type AssistantAction } from "@/lib/assistant/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ASSISTANT_MODEL ?? "claude-opus-5-5";
const MAX_TURNS = 16; // conversation turns sent to the model
const MAX_USER_TURNS = 40; // per conversation (session)
const MAX_BODY = 16 * 1024; // bytes; a request carries one message of up to 1500 characters
const DAILY_AI_LIMIT = () => Math.max(0, Number(process.env.ASSISTANT_DAILY_LIMIT ?? 1500) || 0); // AI calls per day, then basic mode
const MAX_TOOL_ROUNDS = 4;
const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

type ChatTurn = { role: "user" | "assistant"; text: string };
type Event =
  | { type: "text"; delta: string }
  | { type: "action"; action: AssistantAction }
  | { type: "done"; mode: "ai" | "basic" }
  | { type: "error"; code: "rate_limited" | "bad_request" | "unavailable" };

const REFUSAL = {
  az: "Bağışlayın, bu sorğuya cavab verə bilmirəm. Cyberpoint-in xidmətləri barədə başqa sualınız varsa, kömək etməyə hazıram.",
  en: "Sorry, I can't help with that request. I'm happy to answer other questions about Cyberpoint's services.",
  ru: "К сожалению, я не могу ответить на этот запрос. С радостью помогу с другими вопросами об услугах Cyberpoint.",
};

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());

/** One new visitor message; the history is never taken from the client (it is loaded from the database). */
function sanitize(body: unknown): { sessionId: string; locale: Locale; message: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const sessionId = typeof b.sessionId === "string" && /^[a-zA-Z0-9-]{16,64}$/.test(b.sessionId) ? b.sessionId : null;
  const locale = (locales as readonly string[]).includes(String(b.locale)) ? (b.locale as Locale) : null;
  // Older widget versions sent the whole history: take only its last visitor message.
  const legacy = Array.isArray(b.messages) ? (b.messages as { role?: unknown; text?: unknown }[]).filter((m) => m?.role === "user" && typeof m.text === "string").pop()?.text : undefined;
  const message = typeof b.message === "string" ? b.message : typeof legacy === "string" ? legacy : "";
  if (!sessionId || !locale || !message.trim()) return null;
  return { sessionId, locale, message: message.slice(0, 1500) };
}

function loadHistory(sessionId: string): ChatTurn[] {
  const row = get<{ transcript: string }>("SELECT transcript FROM assistant_chats WHERE session_id = ?", sessionId);
  if (!row) return [];
  try {
    const t = JSON.parse(row.transcript);
    return Array.isArray(t) ? t.filter((x) => (x?.role === "user" || x?.role === "assistant") && typeof x.text === "string") : [];
  } catch {
    return [];
  }
}

/** Counts AI calls per day in the database; returns false once the daily limit is reached. */
function takeAiBudget(): boolean {
  const limit = DAILY_AI_LIMIT();
  if (!limit) return false;
  const day = new Date().toISOString().slice(0, 10);
  const row = get<{ value: string }>("SELECT value FROM settings WHERE key = 'assistant_usage'");
  let usage = { day, count: 0 };
  try {
    const u = row ? JSON.parse(row.value) : null;
    if (u?.day === day && Number.isFinite(u.count)) usage = u;
  } catch {
    /* reset */
  }
  if (usage.count >= limit) return false;
  usage.count += 1;
  run("INSERT INTO settings (key, value) VALUES ('assistant_usage', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", JSON.stringify(usage));
  return true;
}

function saveChat(sessionId: string, locale: Locale, turns: ChatTurn[], mode: "ai" | "basic", consultation: boolean) {
  const transcript = JSON.stringify(turns.slice(-60));
  const exists = get("SELECT id FROM assistant_chats WHERE session_id = ?", sessionId);
  if (exists) {
    run(
      "UPDATE assistant_chats SET locale = ?, transcript = ?, turns = ?, mode = ?, consultation = MAX(consultation, ?), is_read = 0, updated_at = datetime('now') WHERE session_id = ?",
      locale, transcript, turns.filter((t) => t.role === "user").length, mode, consultation ? 1 : 0, sessionId,
    );
  } else {
    run(
      "INSERT INTO assistant_chats (session_id, locale, transcript, turns, mode, consultation) VALUES (?,?,?,?,?,?)",
      sessionId, locale, transcript, turns.filter((t) => t.role === "user").length, mode, consultation ? 1 : 0,
    );
  }
}

/** Claude tool loop. Streams text deltas and client actions through `emit`; returns the full reply text. */
async function runClaude(locale: Locale, sessionId: string, turns: ChatTurn[], emit: (e: Event) => void, ip: string) {
  let current = locale;
  let reply = "";
  let consultation = false;

  // History as plain text turns, starting with a user turn.
  let history = turns.slice(-MAX_TURNS);
  while (history.length && history[0].role !== "user") history = history.slice(1);
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.text }));

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = anthropic().beta.messages.stream({
      model: MODEL,
      max_tokens: 1500, // short conversational answers; also bounds the cost of each call
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // re-run on a fallback model if a safety classifier declines
      output_config: { effort: "low" }, // conversational replies; keeps latency low
      system: [{ type: "text", text: systemPrompt(current, buildKnowledge(current)), cache_control: { type: "ephemeral" } }],
      tools: TOOLS,
      messages,
    });
    stream.on("text", (delta) => {
      reply += delta;
      emit({ type: "text", delta });
    });

    let message: Anthropic.Beta.BetaMessage;
    try {
      message = await stream.finalMessage();
    } catch (err) {
      // Eager input streaming: an unparseable tool input rejects finalMessage. Retry the round once; rethrow API errors.
      if (err instanceof Anthropic.APIError || round > 0) throw err;
      continue;
    }

    if (message.stop_reason === "refusal") {
      if (!reply.trim()) {
        reply = REFUSAL[current];
        emit({ type: "text", delta: reply });
      }
      break;
    }
    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (message.stop_reason !== "tool_use" || toolUses.length === 0) break;

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const out = await runTool(tu.name, tu.input, current, sessionId, ip);
      if (out.action) {
        emit({ type: "action", action: out.action });
        if (out.action.type === "language") current = out.action.locale;
      }
      if (out.consultationId) consultation = true;
      results.push({ type: "tool_result", tool_use_id: tu.id, content: out.result, is_error: out.isError || undefined });
    }
    messages.push({ role: "user", content: results });
    if (reply && !/\s$/.test(reply)) {
      reply += "\n\n";
      emit({ type: "text", delta: "\n\n" });
    }
  }
  return { reply: reply.trim(), locale: current, consultation };
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const allowed = rateLimit(`assistant:${ip}`, 30, 10 * 60 * 1000);
  const raw = allowed ? await readBody(request, MAX_BODY) : null;
  let input: ReturnType<typeof sanitize> = null;
  try {
    input = raw ? sanitize(JSON.parse(raw.toString("utf8"))) : null;
  } catch {
    input = null;
  }
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      const emit = (e: Event) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        if (!allowed) return emit({ type: "error", code: "rate_limited" });
        if (!input) return emit({ type: "error", code: "bad_request" });
        const { sessionId, locale, message } = input;
        const history = loadHistory(sessionId);
        if (history.filter((t) => t.role === "user").length >= MAX_USER_TURNS || !rateLimit(`assistant-s:${sessionId}`, 20, 10 * 60 * 1000)) {
          return emit({ type: "error", code: "rate_limited" });
        }
        const turns: ChatTurn[] = [...history, { role: "user", text: message }];

        let mode: "ai" | "basic" = "basic";
        let reply = "";
        let consultation = false;
        let finalLocale = locale;

        if (aiEnabled() && takeAiBudget()) {
          try {
            const r = await runClaude(locale, sessionId, turns, emit, ip);
            ({ reply, consultation } = r);
            finalLocale = r.locale;
            mode = "ai";
          } catch (err) {
            console.error("[assistant] Claude request failed:", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
            if (reply) {
              emit({ type: "error", code: "unavailable" });
            }
          }
        }
        if (mode === "basic" && !reply) {
          const b = basicReply(message, locale);
          for (const a of b.actions) {
            emit({ type: "action", action: a });
            if (a.type === "language") finalLocale = a.locale;
          }
          reply = b.text;
          emit({ type: "text", delta: reply });
        }

        saveChat(sessionId, finalLocale, [...turns, { role: "assistant", text: reply }], mode, consultation);
        emit({ type: "done", mode });
      } catch (err) {
        console.error("[assistant] failed:", err);
        emit({ type: "error", code: "unavailable" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
  });
}
