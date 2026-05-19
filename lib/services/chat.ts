import {
  processFinancialMessage,
  type ExpenseLogged,
  type FinancialMessageResult,
} from "./financial-message";

export type ChatResult = {
  reply: string;
  expenseLogged: { amount: number; category: string } | null;
};

export type { ExpenseLogged, FinancialMessageResult };

export async function processChatMessage(
  userId: string,
  message: string,
): Promise<ChatResult> {
  const result = await processFinancialMessage(userId, message, {
    channel: "web",
  });
  return {
    reply: result.reply,
    expenseLogged: result.expenseLogged
      ? {
          amount: result.expenseLogged.amount,
          category: result.expenseLogged.category,
        }
      : null,
  };
}
