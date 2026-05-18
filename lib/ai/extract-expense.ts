import { jsonCompletion } from "./openrouter";
import { EXPENSE_EXTRACTION_SYSTEM } from "./prompts";
import { normalizeCategory, type ExpenseCategory } from "../finance/categories";

export type ExtractedExpense = {
  amount: number;
  category: ExpenseCategory;
  description: string | null;
};

type ExtractionResult = {
  amount: number | null;
  category: string | null;
  description: string | null;
  isExpense: boolean;
};

export async function extractExpenseFromMessage(
  message: string,
): Promise<ExtractedExpense | null> {
  const parsed = await jsonCompletion<ExtractionResult>(
    EXPENSE_EXTRACTION_SYSTEM,
    message,
  );
  if (!parsed?.isExpense || parsed.amount == null || parsed.amount <= 0) {
    return null;
  }
  return {
    amount: parsed.amount,
    category: normalizeCategory(parsed.category ?? "Other"),
    description: parsed.description,
  };
}
