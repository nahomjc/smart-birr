"use client";

import { HtmlMessage } from "./html-message";

type ChatMessageContentProps = {
  content: string;
  /** Assistant messages use HTML; user messages stay plain text. */
  asHtml?: boolean;
};

export function ChatMessageContent({
  content,
  asHtml = false,
}: ChatMessageContentProps) {
  if (!asHtml) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return <HtmlMessage html={content} />;
}
