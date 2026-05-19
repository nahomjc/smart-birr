import { extractExpenseFromMessage } from "@/lib/ai/extract-expense";
import { getRecentConversationMessages } from "@/lib/ai/conversation-memory";
import { financialCounselorReply } from "@/lib/ai/openrouter";
import {
  formatExpenseLoggedTelegram,
  getBudgetInsightSnapshot,
} from "@/lib/finance/budget-insights";
import {
  getUserContext,
  logExpense,
  saveConversation,
  updateUserIncome,
  upsertBudgetFromIncome,
} from "@/lib/users/service";

export type ExpenseLogged = {
  amount: number;
  category: string;
  confidence: number;
};

export type FinancialMessageResult = {
  reply: string;
  expenseLogged: ExpenseLogged | null;
  /** Pre-formatted block for Telegram when an expense was saved */
  telegramExpenseBlock: string | null;
};

export async function processFinancialMessage(
  userId: string,
  message: string,
  options?: { channel?: "web" | "telegram" },
): Promise<FinancialMessageResult> {
  const channel = options?.channel ?? "web";

  const incomeMatch = message.match(
    /(?:income|earn|make|salary)\s*(?:is|:)?\s*([\d,]+)\s*(?:birr|etb)?/i,
  );
  if (incomeMatch) {
    const income = Number(incomeMatch[1].replace(/,/g, ""));
    if (income > 0) {
      await updateUserIncome(userId, income);
      await upsertBudgetFromIncome(userId, income);
    }
  }

  let expenseLogged: ExpenseLogged | null = null;
  let telegramExpenseBlock: string | null = null;

  const extracted = await extractExpenseFromMessage(message);
  if (extracted) {
    await logExpense(
      userId,
      extracted.amount,
      extracted.category,
      extracted.description ?? message,
      undefined,
      extracted.confidence,
    );
    expenseLogged = {
      amount: extracted.amount,
      category: extracted.category,
      confidence: extracted.confidence,
    };

    const snapshot = await getBudgetInsightSnapshot(userId);
    if (channel === "telegram") {
      telegramExpenseBlock = formatExpenseLoggedTelegram(
        extracted.category,
        extracted.amount,
        snapshot,
      );
    }
  }

  const [context, history] = await Promise.all([
    getUserContext(userId),
    getRecentConversationMessages(userId),
  ]);

  const userPrompt =
    expenseLogged && channel === "telegram"
      ? `${message}\n\n[System: Expense was just saved — ${expenseLogged.amount} ETB ${expenseLogged.category}. Give brief coaching only; receipt details are already shown.]`
      : message;

  const aiReply = await financialCounselorReply(
    userPrompt,
    context || undefined,
    history,
  );

  let reply = aiReply;
  if (channel === "web" && expenseLogged) {
    reply += `\n\n✅ Logged: ${expenseLogged.amount.toLocaleString()} ETB — ${expenseLogged.category}`;
  }

  if (channel === "telegram" && telegramExpenseBlock) {
    reply = `${telegramExpenseBlock}\n\n${aiReply}`;
  }

  await saveConversation(userId, message, reply);

  return { reply, expenseLogged, telegramExpenseBlock };
}
