import type { MetadataRoute } from "next";

const SITE = (process.env.SITE_URL ?? "https://cyberpoint.az").replace(/\/$/, "");

// AI crawlers explicitly welcomed (search/answer and training), per Cyberpoint's choice.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", // OpenAI
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", // Anthropic
  "PerplexityBot", "Perplexity-User", // Perplexity
  "Google-Extended", "GoogleOther", // Google AI
  "Applebot", "Applebot-Extended", // Apple
  "Bingbot", "DuckAssistBot", "YouBot", "MistralAI-User", "cohere-ai", "Amazonbot", "meta-externalagent", "CCBot",
];

const allow = ["/", "/api/public/", "/llms.txt", "/llms-full.txt", "/md/"];
const disallow = ["/admin", "/api/", "/*/search"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow, disallow }, { userAgent: AI_BOTS, allow, disallow }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
