const ALLOWED_TAGS = /<\/?(?:b|i|u|s|code|br|p)(?:\s[^>]*)?>/gi;

/** Escape text, then restore allowed Telegram-style HTML tags. */
export function sanitizeChatHtml(text: string): string {
  const tags: string[] = [];
  const placeholder = (tag: string) => {
    tags.push(tag);
    return `__CHAT_TAG_${tags.length - 1}__`;
  };

  const stripped = text.replace(ALLOWED_TAGS, placeholder);

  const escaped = stripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(/__CHAT_TAG_(\d+)__/g, (_, i) => tags[Number(i)] ?? "");
}
