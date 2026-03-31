"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const INTRO =
  "Hi — I am Haizom Studio’s site assistant. Ask about services, portfolio, quotes, or how to reach our team.";

/** Renders plain text with clickable https:// and mailto: links (no Markdown). */
function ChatMessageBody({ text, isUser }: { text: string; isUser: boolean }) {
  const re = /(https?:\/\/\S+|mailto:\S+)/gi;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags);
  let key = 0;
  while ((m = r.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`t-${key++}`}>{text.slice(last, m.index)}</span>
      );
    }
    let href = m[0];
    href = href.replace(/[.,;:!?)]+$/g, "");
    nodes.push(
      <a
        key={`a-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`break-words underline underline-offset-2 ${
          isUser ? "text-white" : "text-primary"
        }`}
      >
        {href}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`t-${key++}`}>{text.slice(last)}</span>);
  }
  return <>{nodes.length > 0 ? nodes : text}</>;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: INTRO },
  ]);
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const hidden = pathname?.startsWith("/admin") ?? false;

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply =
        typeof data.reply === "string"
          ? data.reply
          : data.error ?? "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }, [pending]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      <div
        id="haizom-chat-panel"
        className={`pointer-events-auto flex max-h-[min(32rem,calc(100vh-8rem))] w-[min(100vw-2rem,22rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-dark_border bg-darkmode text-left shadow-dark-md transition-all duration-300 ease-out dark:border-dark_border ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible translate-y-2 scale-95 opacity-0"
        }`}
        role="dialog"
        aria-label="Chat with Haizom Studio"
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-dark_border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Icon icon="ion:chatbubbles-outline" className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Haizom Studio</p>
              <p className="text-xs text-white/50">Typically replies instantly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <Icon icon="ion:close" className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-darklight text-white/90 border border-dark_border"
                }`}
              >
                <ChatMessageBody text={msg.content} isUser={msg.role === "user"} />
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-dark_border bg-darklight px-3 py-2 text-sm text-white/60">
                …
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-dark_border px-3 py-2">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-white/40">
            Quick links
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-full border border-dark_border bg-darklight px-2.5 py-1 text-xs text-white/80 transition hover:border-primary/50 hover:text-white"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>

        <form
          className="shrink-0 border-t border-dark_border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="min-w-0 flex-1 rounded-xl border border-dark_border bg-darklight px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none ring-primary/40 focus:ring-2"
              disabled={pending}
              autoComplete="off"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Icon icon="ion:send" className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-dark-md transition hover:bg-blue-600 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-expanded={open}
        aria-controls="haizom-chat-panel"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <Icon
          icon={open ? "ion:close" : "ion:chatbubbles"}
          className="h-7 w-7"
          aria-hidden
        />
      </button>
    </div>
  );
}
