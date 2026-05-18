"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/app/actions/chat";

type Message = {
  role: "user" | "assistant";
  content: string;
  expenseLogged?: { amount: number; category: string };
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        'Hi! I\'m Smart Birr, your AI financial counselor. Ask about budgeting, saving, or log spending — e.g. "Spent 500 birr on lunch".',
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function send() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    scrollToBottom();

    startTransition(async () => {
      try {
        const data = await sendChatMessage(text);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.reply,
            expenseLogged: data.expenseLogged ?? undefined,
          },
        ]);
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              e instanceof Error
                ? e.message
                : "Something went wrong. Check your API keys and database.",
          },
        ]);
      }
      scrollToBottom();
    });
  }

  return (
    <div className="flex h-[min(70vh,600px)] flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.expenseLogged && (
                <p className="mt-2 text-xs opacity-80">
                  Logged {msg.expenseLogged.amount} ETB —{" "}
                  {msg.expenseLogged.category}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
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
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
          disabled={isPending}
        />
        <Button onClick={send} disabled={isPending}>
          {isPending ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
