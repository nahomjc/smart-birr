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

const CATEGORY_CALLBACK_PREFIX = "exp_cat:";

export function categoryCallbackData(category: string): string {
  return `${CATEGORY_CALLBACK_PREFIX}${category}`;
}

export function parseCategoryCallback(data: string): string | null {
  if (!data.startsWith(CATEGORY_CALLBACK_PREFIX)) return null;
  const category = data.slice(CATEGORY_CALLBACK_PREFIX.length);
  return category.length > 0 ? category : null;
}

export function buildCategoryInlineKeyboard() {
  const rows: { text: string; callback_data: string }[][] = [];
  const cats = [...EXPENSE_CATEGORIES];
  for (let i = 0; i < cats.length; i += 2) {
    const row = cats.slice(i, i + 2).map((name) => ({
      text: name,
      callback_data: categoryCallbackData(name),
    }));
    rows.push(row);
  }
  rows.push([{ text: "✖ Cancel", callback_data: "exp_cancel" }]);
  return { inline_keyboard: rows };
}

export const CALLBACK_EXPENSE_CANCEL = "exp_cancel";
export const CALLBACK_SKIP_DESC = "exp_skip_desc";
