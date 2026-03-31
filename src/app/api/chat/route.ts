import { NextResponse } from "next/server";
import {
  getChatPublicBaseUrl,
  tryWorkersAiReply,
} from "@/lib/chat-workers-ai";

export const runtime = "edge";

const MAX_LEN = 2000;

function contactPageUrl(): string {
  return `${getChatPublicBaseUrl()}/contact`;
}

function replyForMessage(raw: string): string {
  const m = raw.trim().toLowerCase();
  if (!m) {
    return "Ask me about our services, portfolio, or how to get a quote — or use the shortcuts below.";
  }

  if (
    /\b(are you (an? )?(ai|chatgpt|chatai|gpt|a bot|openai)|you a (llm|model|chatbot)|what model|large language model)\b/.test(
      m
    )
  ) {
    return "I'm Haizom Studio's site assistant — here to help with our services, portfolio, and how to request a quote or contact the team.";
  }

  if (/\b(hello|hi|hey|good\s*(morning|afternoon|evening))\b/.test(m)) {
    return "Hi — thanks for visiting Haizom Studio. We build websites, apps, and automation. What would you like to explore first: services, portfolio, or getting a quote?";
  }

  if (/\b(service|services|what\s*do\s*you\s*(do|offer)|offer|build|develop|stack)\b/.test(m)) {
    return "We deliver end-to-end product work: web experiences, mobile-friendly builds, and automation that fits your workflow. Browse our Services page for detail, or tell us your goal and we can point you to the right engagement.";
  }

  if (/\b(portfolio|work|projects|case\s*stud|examples?)\b/.test(m)) {
    return "Our Portfolio highlights selected builds and outcomes. Open the Portfolio section on the site to see how we approach design and engineering together.";
  }

  if (/\b(quote|pricing|price|budget|cost|how\s*much|estimate)\b/.test(m)) {
    return `Quotes depend on scope, timeline, and integrations. Request a quote on our Contact page: ${contactPageUrl()} — add a short brief (goal, timeline, budget range) and we will follow up.`;
  }

  if (/\b(contact|email|reach|call|phone|book|meeting|call)\b/.test(m)) {
    return `Reach us at contact@haizomstudios.com or +92 334 5577900. Send a project brief here: ${contactPageUrl()}`;
  }

  if (/\b(about|who\s*are\s*you|team|company)\b/.test(m)) {
    return "Haizom Studio focuses on reliable engineering from concept to execution — clear communication, solid delivery, and work you can maintain. The About page has more on how we work.";
  }

  if (/\b(blog|article|post)\b/.test(m)) {
    return "We share updates and notes on the Blog — useful if you want to see how we think about product and delivery.";
  }

  return "Thanks for your message. For tailored answers, mention services, portfolio, pricing, or contact — or use the shortcuts below to jump to the right page.";
}

export async function POST(req: Request) {
  let body: { message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message =
    typeof body.message === "string" ? body.message.slice(0, MAX_LEN) : "";

  const fromAi = await tryWorkersAiReply(message);
  const reply = fromAi ?? replyForMessage(message);

  return NextResponse.json({
    reply,
    source: fromAi ? "ai" : "rules",
  });
}
