import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

/**
 * Cloudflare Pages: add a Workers AI binding named `AI` (Workers AI → binding "AI").
 * Disable AI from the dashboard without redeploying: CHAT_USE_AI=false
 *
 * When daily Neurons are exhausted (or rate limits hit), we stop calling Workers AI
 * until UTC midnight so we do not keep hammering the API; responses fall back to
 * rule-based text (no extra paid Neurons on failure for typical quota errors).
 */

type AiBinding = {
  run: (model: string, options: Record<string, unknown>) => Promise<unknown>;
};

type EnvWithAi = { AI?: AiBinding };

const MODEL = "@cf/meta/llama-3.2-1b-instruct";

/** Public site origin for quote/contact links. Override in Cloudflare: CHAT_PUBLIC_BASE_URL */
export function getChatPublicBaseUrl(): string {
  const raw =
    process.env.CHAT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://haizomstudios.com";
  return raw.replace(/\/$/, "");
}

function buildSystemPrompt(): string {
  // Direct contact details hidden (Upwork terms).
  // const base = getChatPublicBaseUrl();
  // const contactPage = `${base}/contact`;

  return `You are the Haizom Studio website assistant. You represent Haizom Studio only.

Rules you must follow:
- Speak in first person as the studio ("we", "our") or as this assistant helping visitors. Never say you are an AI model, ChatGPT, OpenAI, a "large language model", or a generic chatbot. Never discuss your training or limitations unless someone asks for technical details — then say briefly that you are Haizom's site assistant.
- Output plain text only. Do NOT use Markdown: no [square brackets with parentheses], no **bold**, no bullet lists with dashes, no backticks.
- When the user wants a quote, to hire us, or to contact the team, tell them to send us a message on Upwork and give this exact plain URL: https://www.upwork.com/freelancers/bilaldawar Never give an email address, phone number, social media account, or any other way to contact us outside Upwork, and never ask for the visitor's contact details.
- Haizom builds websites, apps, and automation. Quotes depend on scope; ask people to message us on Upwork with their brief.
- Be concise (2–5 short sentences). Do not invent team size, named clients, or guarantees.`;
}

/** Turn accidental Markdown into plain text so the chat UI does not show raw syntax. */
export function stripMarkdownArtifactsForChat(s: string): string {
  let t = s.trim();
  t = t.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_, _label: string, url: string) =>
    url.trim()
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*]+)\*/g, "$1");
  t = t.replace(/`([^`]+)`/g, "$1");
  return t.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

/** In-memory per-isolate circuit breaker (reduces repeated AI calls after quota errors). */
let aiPausedUntilMs = 0;

function chatAiDisabledByEnv(): boolean {
  const v = process.env.CHAT_USE_AI?.trim().toLowerCase();
  return v === "false" || v === "0" || v === "off";
}

function msUntilUtcMidnight(): number {
  const now = Date.now();
  const t = new Date(now);
  const nextUtc = Date.UTC(
    t.getUTCFullYear(),
    t.getUTCMonth(),
    t.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(0, nextUtc - now);
}

function isQuotaOrLimitError(err: unknown): boolean {
  const s =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === "object" && err !== null
        ? JSON.stringify(err)
        : String(err);
  return /429|403|quota|limit|rate|neuron|exceeded|throttl|capacity|billing|insufficient|denied/i.test(
    s
  );
}

function extractAssistantText(result: unknown): string | null {
  if (result == null) return null;
  if (typeof result === "string") {
    const t = result.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof result === "object" && result !== null && "response" in result) {
    const r = (result as { response: unknown }).response;
    if (typeof r === "string") {
      const t = r.trim();
      return t.length > 0 ? t : null;
    }
  }
  return null;
}

function pauseAi(ms: number): void {
  aiPausedUntilMs = Date.now() + ms;
}

/**
 * Returns assistant text from Workers AI, or null to use rule-based fallback.
 * On quota/limit-style errors, pauses AI calls until UTC midnight (aligned with CF daily reset).
 * On other errors, pauses briefly to avoid a tight failure loop.
 */
export async function tryWorkersAiReply(userMessage: string): Promise<string | null> {
  if (chatAiDisabledByEnv()) {
    return null;
  }

  if (Date.now() < aiPausedUntilMs) {
    return null;
  }

  const ctx = getOptionalRequestContext();
  const ai = ctx?.env ? (ctx.env as EnvWithAi).AI : undefined;
  if (!ai) {
    return null;
  }

  const trimmed = userMessage.trim().slice(0, 2000);
  if (!trimmed) {
    return null;
  }

  try {
    const result = await ai.run(MODEL, {
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: trimmed },
      ],
      max_tokens: 256,
    });

    const text = extractAssistantText(result);
    if (!text) {
      return null;
    }
    return stripMarkdownArtifactsForChat(text);
  } catch (err) {
    const pauseMs = isQuotaOrLimitError(err) ? msUntilUtcMidnight() : 60_000;
    pauseAi(pauseMs);
    return null;
  }
}
