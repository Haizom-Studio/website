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

const SYSTEM_PROMPT = `You are the public chat assistant for Haizom Studio, a software and product engineering studio.
Be concise (2–5 short sentences). Tone: professional, friendly, clear.
Facts: They build websites, apps, and automation; contact is contact@haizomstudios.com and phone +92 334 5577900.
If asked for a quote or pricing, say scope varies and direct them to the Contact page with a brief.
Do not invent team size, clients, or guarantees. Do not use markdown or bullet lists unless the user asks.`;

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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
      max_tokens: 256,
    });

    const text = extractAssistantText(result);
    if (!text) {
      return null;
    }
    return text;
  } catch (err) {
    const pauseMs = isQuotaOrLimitError(err) ? msUntilUtcMidnight() : 60_000;
    pauseAi(pauseMs);
    return null;
  }
}
