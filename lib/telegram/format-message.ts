/**
 * Normalize AI text into Telegram-safe HTML with clear line breaks and bullets.
 */
export function formatTelegramAiReply(raw: string): string {
  let text = raw.trim();
  if (!text) return text;

  text = text.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();
  text = text.replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>");
  text = text.replace(/__([\s\S]+?)__/g, "<b>$1</b>");
  text = text.replace(/\*([^*\n]+)\*/g, "<i>$1</i>");
  text = text.replace(/^#{1,3}\s+(.+)$/gm, "<b>$1</b>");
  text = text.replace(/^\s*[-*]\s+/gm, "• ");
  text = text.replace(/^\s*(\d+)[.)]\s+/gm, "$1. ");
  text = text.replace(/\n{3,}/g, "\n\n");

  return sanitizeTelegramHtml(text);
}

function sanitizeTelegramHtml(text: string): string {
  const tags: string[] = [];
  const placeholder = (tag: string) => {
    tags.push(tag);
    return `__TG_TAG_${tags.length - 1}__`;
  };

  const stripped = text.replace(
    /<\/?(?:b|i|u|s|code|pre|a)(?:\s[^>]*)?>/gi,
    placeholder,
  );

  const escaped = stripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(/__TG_TAG_(\d+)__/g, (_, i) => tags[Number(i)] ?? "");
}

/** Format full outbound Telegram message (expense receipt + AI coaching). */
export function formatTelegramOutboundMessage(text: string): string {
  return formatTelegramAiReply(text);
}
