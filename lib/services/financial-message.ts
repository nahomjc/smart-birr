import { extractExpenseFromMessage } from "@/lib/ai/extract-expense";
import {
  getRecentConversationMessages,
  MEMORY_TURNS_TELEGRAM,
  MEMORY_TURNS_WEB,
} from "@/lib/ai/conversation-memory";
import {
  financialCounselorReply,
  isOpenRouterCreditsError,
  isOpenRouterPromptTooLargeError,
  isOpenRouterRateLimitError,
  userFacingOpenRouterError,
  type ChatMessage,
} from "@/lib/ai/openrouter";
import {
  formatExpenseLoggedTelegram,
  getBudgetInsightSnapshot,
} from "@/lib/finance/budget-insights";
import { formatTelegramOutboundMessage } from "@/lib/telegram/format-message";
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

export type FinancialMessagePrep = {
  channel: "web" | "telegram";
  userPrompt: string;
  context: string;
  history: ChatMessage[];
  expenseLogged: ExpenseLogged | null;
  telegramExpenseBlock: string | null;
};

export async function prepareFinancialMessage(
  userId: string,
  message: string,
  options?: { channel?: "web" | "telegram" },
): Promise<FinancialMessagePrep> {
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
    getRecentConversationMessages(userId, {
      maxTurns: channel === "telegram" ? MEMORY_TURNS_TELEGRAM : MEMORY_TURNS_WEB,
    }),
  ]);

  const userPrompt =
    expenseLogged && channel === "telegram"
      ? `${message}\n\n[System: Expense was just saved — ${expenseLogged.amount} ETB ${expenseLogged.category}. Give brief coaching only; receipt details are already shown.]`
      : message;

  return {
    channel,
    userPrompt,
    context: context || "",
    history,
    expenseLogged,
    telegramExpenseBlock,
  };
}

export function webExpenseLoggedSuffix(expenseLogged: ExpenseLogged | null): string {
  if (!expenseLogged) return "";
  return `\n\n✅ Logged: ${expenseLogged.amount.toLocaleString()} ETB — ${expenseLogged.category}`;
}

function aiUnavailableReply(
  channel: "web" | "telegram",
  expenseLogged: ExpenseLogged | null,
  error?: unknown,
): string {
  let hint = "";
  if (error && isOpenRouterPromptTooLargeError(error)) {
    hint =
      " Your account prompt limit is low — add OpenRouter credits or use 📝 Log expense (no AI).";
  } else if (error && isOpenRouterCreditsError(error)) {
    hint = " Add credits at openrouter.ai/settings/credits.";
  } else if (error && isOpenRouterRateLimitError(error)) {
    hint = " The AI provider is busy — wait a minute and try again, or use 📝 Log expense.";
  } else if (error) {
    const friendly = userFacingOpenRouterError(error);
    if (friendly && !friendly.includes("temporarily unavailable")) {
      hint = ` ${friendly}`;
    }
  }

  if (channel === "telegram") {
    if (expenseLogged) {
      return `⚠️ AI coaching is temporarily unavailable.${hint}\n\nYour expense was still saved. Use 📊 Budget or 📈 Report for details.`;
    }
    return `⚠️ AI replies are temporarily unavailable.${hint}\n\nUse 📝 Log expense to record spending, or 📈 Report for your summary.`;
  }

  if (expenseLogged) {
    return `AI coaching is temporarily unavailable.${hint} Your expense was still logged: ${expenseLogged.amount.toLocaleString()} ETB — ${expenseLogged.category}.`;
  }
  return `AI is temporarily unavailable.${hint} Try again later or use the dashboard to log expenses.`;
}

export async function processFinancialMessage(
  userId: string,
  message: string,
  options?: { channel?: "web" | "telegram" },
): Promise<FinancialMessageResult> {
  const channel = options?.channel ?? "web";

  try {
    let prep: FinancialMessagePrep;
    try {
      prep = await prepareFinancialMessage(userId, message, options);
    } catch (error) {
      console.error("prepareFinancialMessage failed:", error);
      const reply = aiUnavailableReply(channel, null, error);
      return {
        reply,
        expenseLogged: null,
        telegramExpenseBlock: null,
      };
    }

    let aiReply: string;
    try {
      aiReply = await financialCounselorReply(
        prep.userPrompt,
        prep.context || undefined,
        prep.history,
        { channel: prep.channel },
      );
      if (!aiReply.trim()) {
        throw new Error("OpenRouter returned an empty reply");
      }
    } catch (error) {
      console.error("financialCounselorReply failed:", error);
      aiReply = aiUnavailableReply(prep.channel, prep.expenseLogged, error);
    }

    let reply = aiReply;
    if (prep.channel === "web") {
      reply += webExpenseLoggedSuffix(prep.expenseLogged);
    }

    if (prep.channel === "telegram") {
      const coaching = formatTelegramOutboundMessage(aiReply);
      reply = prep.telegramExpenseBlock
        ? `${prep.telegramExpenseBlock}\n\n${coaching}`
        : coaching;
    }

    try {
      await saveConversation(userId, message, reply);
    } catch (error) {
      console.error("saveConversation failed:", error);
    }

    return {
      reply,
      expenseLogged: prep.expenseLogged,
      telegramExpenseBlock: prep.telegramExpenseBlock,
    };
  } catch (error) {
    console.error("processFinancialMessage failed:", error);
    return {
      reply: aiUnavailableReply(channel, null, error),
      expenseLogged: null,
      telegramExpenseBlock: null,
    };
  }
}
