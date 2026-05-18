export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Subscriptions",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Education",
  "Entertainment",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function normalizeCategory(raw: string): ExpenseCategory {
  const lower = raw.toLowerCase().trim();
  const match = EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === lower);
  if (match) return match;
  if (lower.includes("food") || lower.includes("lunch") || lower.includes("dinner"))
    return "Food";
  if (lower.includes("taxi") || lower.includes("bus") || lower.includes("fuel"))
    return "Transport";
  if (lower.includes("rent") || lower.includes("housing")) return "Rent";
  if (lower.includes("netflix") || lower.includes("subscription"))
    return "Subscriptions";
  return "Other";
}
