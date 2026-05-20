import { formatTelegramAiReply } from "@/lib/telegram/format-message";

/** Normalize AI markdown/HTML for safe rendering in web chat. */
export function prepareWebChatHtml(raw: string): string {
  return formatTelegramAiReply(raw);
}
