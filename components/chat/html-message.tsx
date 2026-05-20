"use client";

import { sanitizeChatHtml } from "@/lib/chat/sanitize-html";

type HtmlMessageProps = {
  html: string;
  className?: string;
};

/** Renders counselor HTML (<b>, <i>, <code>, line breaks) safely. */
export function HtmlMessage({ html, className = "" }: HtmlMessageProps) {
  const safe = sanitizeChatHtml(html);

  return (
    <div
      className={`chat-html whitespace-pre-wrap leading-relaxed [&_b]:font-semibold [&_b]:text-zinc-50 [&_code]:rounded [&_code]:bg-emerald-950/60 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_code]:text-emerald-200 [&_i]:italic [&_i]:text-zinc-300 ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized counselor HTML only
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
