import Anthropic from "@anthropic-ai/sdk";
import { locales, type Locale } from "@/i18n/config";
import { rateLimit } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { basicReply } from "@/lib/assistant/basic";
import { buildKnowledge } from "@/lib/assistant/knowledge";
import { runTool, systemPrompt, TOOLS, type AssistantAction } from "@/lib/assistant/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ASSISTANT_MODEL ?? "claude-opus-5-5";
const MAX_TURNS = 16; // conversation turns sent to the model
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

function sanitize(body: unknown): { sessionId: string; locale: Locale; turns: ChatTurn[] } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const sessionId = typeof b.sessionId === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(b.sessionId) ? b.sessionId : null;
  const locale = (locales as readonly string[]).includes(String(b.locale)) ? (b.locale as Locale) : null;
  if (!sessionId || !locale || !Array.isArray(b.messages)) return null;
  const turns = (b.messages as unknown[])
    .filter((m): m is ChatTurn => !!m && typeof m === "object" && ((m as ChatTurn).role === "user" || (m as ChatTurn).role === "assistant") && typeof (m as ChatTurn).text === "string")
    .map((m) => ({ role: m.role, text: m.text.slice(0, 1500) }))
    .filter((m) => m.text.trim());
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return { sessionId, locale, turns };
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
async function runClaude(locale: Locale, sessionId: string, turns: ChatTurn[], emit: (e: Event) => void) {
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
      max_tokens: 8000,
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
      const out = await runTool(tu.name, tu.input, current, sessionId);
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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const input = sanitize(await request.json().catch(() => null));
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      const emit = (e: Event) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        if (!input) return emit({ type: "error", code: "bad_request" });
        if (!rateLimit(`assistant:${ip}`, 30, 10 * 60 * 1000)) return emit({ type: "error", code: "rate_limited" });
        const { sessionId, locale, turns } = input;
        const question = turns[turns.length - 1].text;

        let mode: "ai" | "basic" = "basic";
        let reply = "";
        let consultation = false;
        let finalLocale = locale;

        if (aiEnabled()) {
          try {
            const r = await runClaude(locale, sessionId, turns, emit);
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
          const b = basicReply(question, locale);
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
