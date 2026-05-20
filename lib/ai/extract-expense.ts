import { jsonCompletion } from "./openrouter";
import { EXPENSE_EXTRACTION_SYSTEM } from "./prompts";
import { normalizeCategory, type ExpenseCategory } from "../finance/categories";

/** Skip OpenRouter when the message is clearly not logging a purchase. */
export function looksLikeExpenseMessage(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  if (
    /\b(spent|paid|bought|purchase|purchased|cost|expense|expenses|logging)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\d[\d,]*\s*(birr|etb|ብር)\b/i.test(t)) return true;
  if (/\b(birr|etb)\s*\d[\d,]*/i.test(t)) return true;
  return false;
}

export type ExtractedExpense = {
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  confidence: number;
};

type ExtractionResult = {
  amount: number | null;
  category: string | null;
  description: string | null;
  isExpense: boolean;
  confidence?: number | null;
};

export async function extractExpenseFromMessage(
  message: string,
): Promise<ExtractedExpense | null> {
  if (!looksLikeExpenseMessage(message)) {
    return null;
  }

  const parsed = await jsonCompletion<ExtractionResult>(
    EXPENSE_EXTRACTION_SYSTEM,
    message,
  );
  if (!parsed?.isExpense || parsed.amount == null || parsed.amount <= 0) {
    return null;
  }
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0.85;

  return {
    amount: parsed.amount,
    category: normalizeCategory(parsed.category ?? "Other"),
    description: parsed.description,
    confidence,
  };
}
