import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";

export const REPLY_LOG_EXPENSE = "📝 Log expense";
export const REPLY_BUDGET = "📊 Budget";
export const REPLY_REPORT = "📈 Report";
export const REPLY_HELP = "❓ Help";
export const REPLY_CANCEL = "✖ Cancel";
export const REPLY_SKIP_DESC = "⏭ Skip description";

export const MAIN_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: REPLY_LOG_EXPENSE }],
    [{ text: REPLY_BUDGET }, { text: REPLY_REPORT }],
    [{ text: REPLY_HELP }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

export const EXPENSE_AMOUNT_KEYBOARD = {
  keyboard: [[{ text: REPLY_CANCEL }]],
  resize_keyboard: true,
};

export const EXPENSE_DESCRIPTION_KEYBOARD = {
  keyboard: [[{ text: REPLY_SKIP_DESC }], [{ text: REPLY_CANCEL }]],
  resize_keyboard: true,
};

export const EXPENSE_CATEGORY_KEYBOARD = {
  keyboard: [
    [{ text: "Food" }, { text: "Transport" }],
    [{ text: "Rent" }, { text: "Subscriptions" }],
    [{ text: "Shopping" }, { text: "Utilities" }],
    [{ text: "Healthcare" }, { text: "Education" }],
    [{ text: "Entertainment" }, { text: "Other" }],
    [{ text: REPLY_CANCEL }],
  ],
  resize_keyboard: true,
};

const CATEGORY_CALLBACK_PREFIX = "exp_cat:";

function normalizeCategoryToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Short index-based callback_data (Telegram limit 64 bytes; avoids encoding issues). */
export function categoryCallbackData(index: number): string {
  return `${CATEGORY_CALLBACK_PREFIX}${index}`;
}

export function parseCategoryCallback(data: string): string | null {
  if (!data.startsWith(CATEGORY_CALLBACK_PREFIX)) return null;
  const rest = decodeURIComponent(data.slice(CATEGORY_CALLBACK_PREFIX.length)).trim();
  if (!rest.length) return null;

  const idx = Number.parseInt(rest, 10);
  if (Number.isFinite(idx) && idx >= 0 && idx < EXPENSE_CATEGORIES.length) {
    return EXPENSE_CATEGORIES[idx];
  }

  // Legacy buttons: exp_cat:Food
  const legacy = EXPENSE_CATEGORIES.find(
    (c) => c.toLowerCase() === rest.toLowerCase(),
  );
  if (legacy) return legacy;

  // Accept slug-like payloads too (exp_cat:food, exp_cat:health-care, etc).
  const normalized = normalizeCategoryToken(rest);
  const bySlug = EXPENSE_CATEGORIES.find(
    (c) => normalizeCategoryToken(c) === normalized,
  );
  return bySlug ?? null;
}

export function parseCategoryText(text: string): string | null {
  const normalized = normalizeCategoryToken(text);
  const category = EXPENSE_CATEGORIES.find(
    (c) => normalizeCategoryToken(c) === normalized,
  );
  return category ?? null;
}

export function buildCategoryInlineKeyboard() {
  const rows: { text: string; callback_data: string }[][] = [];
  const cats = [...EXPENSE_CATEGORIES];
  for (let i = 0; i < cats.length; i += 2) {
    const row = cats.slice(i, i + 2).map((name, offset) => ({
      text: name,
      callback_data: categoryCallbackData(i + offset),
    }));
    rows.push(row);
  }
  rows.push([{ text: "✖ Cancel", callback_data: "exp_cancel" }]);
  return { inline_keyboard: rows };
}

export const CALLBACK_EXPENSE_CANCEL = "exp_cancel";
export const CALLBACK_SKIP_DESC = "exp_skip_desc";
