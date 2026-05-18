import { financialCounselorReply } from "@/lib/ai/openrouter";
import { extractExpenseFromMessage } from "@/lib/ai/extract-expense";
import {
  getUserContext,
  saveConversation,
  logExpense,
  updateUserIncome,
  upsertBudgetFromIncome,
} from "@/lib/users/service";

export type ChatResult = {
  reply: string;
  expenseLogged: { amount: number; category: string } | null;
};

export async function processChatMessage(
  userId: string,
  message: string,
): Promise<ChatResult> {
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

  let expenseLogged: { amount: number; category: string } | null = null;
  const extracted = await extractExpenseFromMessage(message);
  if (extracted) {
    await logExpense(
      userId,
      extracted.amount,
      extracted.category,
      extracted.description ?? message,
    );
    expenseLogged = {
      amount: extracted.amount,
      category: extracted.category,
    };
  }

  const context = await getUserContext(userId);
  const reply = await financialCounselorReply(
    message,
    context || undefined,
  );
  await saveConversation(userId, message, reply);

  return { reply, expenseLogged };
}
