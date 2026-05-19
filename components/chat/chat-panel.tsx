"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import { TypingIndicator } from "./typing-indicator";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  expenseLogged?: { amount: number; category: string };
  isStreaming?: boolean;
};

function newMessageId() {
  return crypto.randomUUID();
}

type ChatPanelProps = {
  /** Fills parent height; use inside floating shell (no outer card chrome). */
  embedded?: boolean;
  className?: string;
};

export function ChatPanel({ embedded = false, className = "" }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Smart Birr, your AI financial counselor. I can see your budget, expenses, and planning goals. Ask for advice, or log spending — e.g. \"Spent 500 birr on lunch\" or \"Can I afford a laptop this year?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function updateStreamingMessage(
    updater: (msg: Message) => Message,
  ) {
    setMessages((prev) => {
      const next = [...prev];
      const idx = next.findLastIndex(
        (m) => m.role === "assistant" && m.isStreaming,
      );
      if (idx === -1) return prev;
      next[idx] = updater(next[idx]);
      return next;
    });
    scrollToBottom();
  }

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setIsLoading(true);
    setMessages((m) => [
      ...m,
      { id: newMessageId(), role: "user", content: text },
      {
        id: newMessageId(),
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let pending = "";
      let metadataParsed = false;
      let expenseLogged: Message["expenseLogged"];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        pending += decoder.decode(value, { stream: true });

        if (!metadataParsed) {
          const newline = pending.indexOf("\n");
          if (newline === -1) continue;

          const metaLine = pending.slice(0, newline);
          pending = pending.slice(newline + 1);
          metadataParsed = true;

          const meta = JSON.parse(metaLine) as {
            expenseLogged?: Message["expenseLogged"];
            error?: string;
          };
          if (meta.error) throw new Error(meta.error);
          expenseLogged = meta.expenseLogged ?? undefined;

          if (expenseLogged) {
            updateStreamingMessage((m) => ({ ...m, expenseLogged }));
          }
        }

        if (pending) {
          const chunk = pending;
          pending = "";
          updateStreamingMessage((m) => ({
            ...m,
            content: m.content + chunk,
            expenseLogged: expenseLogged ?? m.expenseLogged,
          }));
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.isStreaming ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (e) {
      const errMsg =
        e instanceof Error
          ? e.message
          : "Something went wrong. Check your API keys and database.";
      setMessages((prev) => {
        const next = prev.filter(
          (m) => !(m.role === "assistant" && m.isStreaming && !m.content),
        );
        const streamingIdx = next.findLastIndex(
          (m) => m.role === "assistant" && m.isStreaming,
        );
        if (streamingIdx >= 0) {
          next[streamingIdx] = {
            ...next[streamingIdx],
            content: next[streamingIdx].content || errMsg,
            isStreaming: false,
          };
          return next;
        }
        return [
          ...next,
          {
            id: newMessageId(),
            role: "assistant",
            content: errMsg,
            isStreaming: false,
          },
        ];
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  const shellClass = embedded
    ? "flex h-full min-h-0 flex-col overflow-hidden bg-transparent"
    : "flex h-[min(70vh,600px)] flex-col overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#0f1714] shadow-lg shadow-black/30";

  return (
    <div className={`${shellClass}${className ? ` ${className}` : ""}`}>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => {
          const showTyping =
            msg.role === "assistant" && msg.isStreaming && !msg.content;

          if (showTyping) {
            return (
              <div key={msg.id} className="flex justify-start">
                <TypingIndicator />
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-900/30 bg-[#141f1b] text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.content}
                  {msg.isStreaming && msg.content ? (
                    <span
                      className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-emerald-400/90 align-text-bottom"
                      aria-hidden
                    />
                  ) : null}
                </p>
                {msg.expenseLogged && !msg.isStreaming && (
                  <p className="mt-2 text-xs opacity-80">
                    Logged {msg.expenseLogged.amount} ETB —{" "}
                    {msg.expenseLogged.category}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-emerald-900/30 bg-[#0a1210] p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about budgeting or log an expense..."
          className={`flex-1 rounded-xl ${theme.input}`}
          disabled={isLoading}
        />
        <Button onClick={send} disabled={isLoading}>
          {isLoading ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
