import type { ChatMessage } from "./openrouter";

/** Rough upper bound: ~4 characters per token for English-heavy text. */
export function truncateText(text: string, maxChars: number): string {
  if (maxChars <= 0) return "";
  if (text.length <= maxChars) return text;
  const cut = Math.max(0, maxChars - 16);
  return `${text.slice(0, cut).trimEnd()}\n…(trimmed)`;
}

export function truncateContext(
  context: string | undefined,
  maxChars: number,
): string | undefined {
  if (!context?.trim()) return undefined;
  return truncateText(context.trim(), maxChars);
}

export function trimHistory(
  history: ChatMessage[],
  maxTurns: number,
  maxCharsPerMessage = 500,
): ChatMessage[] {
  if (maxTurns <= 0) return [];
  const kept = history.slice(-maxTurns * 2);
  return kept.map((m) => ({
    ...m,
    content: truncateText(m.content, maxCharsPerMessage),
  }));
}

export type CounselorPromptTier = {
  contextMaxChars: number;
  historyTurns: number;
  maxCharsPerHistoryMessage: number;
};

/** Tiers from full context → minimal (fits low OpenRouter prompt caps). */
export const COUNSELOR_PROMPT_TIERS: Record<
  "web" | "telegram",
  CounselorPromptTier[]
> = {
  telegram: [
    { contextMaxChars: 2_400, historyTurns: 2, maxCharsPerHistoryMessage: 400 },
    { contextMaxChars: 1_200, historyTurns: 1, maxCharsPerHistoryMessage: 300 },
    { contextMaxChars: 500, historyTurns: 0, maxCharsPerHistoryMessage: 200 },
  ],
  web: [
    { contextMaxChars: 10_000, historyTurns: 6, maxCharsPerHistoryMessage: 800 },
    { contextMaxChars: 5_000, historyTurns: 3, maxCharsPerHistoryMessage: 500 },
    { contextMaxChars: 2_000, historyTurns: 1, maxCharsPerHistoryMessage: 400 },
  ],
};
