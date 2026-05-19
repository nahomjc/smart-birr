const TELEGRAM_API = "https://api.telegram.org/bot";

export type TelegramReplyMarkup =
  | { keyboard: { text: string }[][]; resize_keyboard?: boolean; is_persistent?: boolean }
  | { inline_keyboard: { text: string; callback_data: string }[][] };

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name?: string; username?: string };
    message?: { chat: { id: number } };
    data?: string;
  };
};

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return t;
}

const TYPING_REFRESH_MS = 4_000;

export async function sendTelegramTyping(chatId: number): Promise<void> {
  try {
    const res = await fetch(`${TELEGRAM_API}${token()}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram sendChatAction failed:", err);
    }
  } catch (error) {
    console.error("Telegram sendChatAction error:", error);
  }
}

export async function withTelegramTyping<T>(
  chatId: number,
  fn: () => Promise<T>,
): Promise<T> {
  await sendTelegramTyping(chatId);
  const interval = setInterval(() => {
    void sendTelegramTyping(chatId);
  }, TYPING_REFRESH_MS);
  try {
    return await fn();
  } finally {
    clearInterval(interval);
  }
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
  replyMarkup?: TelegramReplyMarkup,
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: parseMode,
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(`${TELEGRAM_API}${token()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram sendMessage failed:", err);
  }
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
) {
  const body: Record<string, unknown> = { callback_query_id: callbackQueryId };
  if (text) body.text = text;

  const res = await fetch(`${TELEGRAM_API}${token()}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram answerCallbackQuery failed:", err);
  }
}

export async function setWebhook(url: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: {
    url: string;
    allowed_updates: string[];
    secret_token?: string;
  } = { url, allowed_updates: ["message", "callback_query"] };
  if (secret) {
    body.secret_token = secret;
  }

  const res = await fetch(`${TELEGRAM_API}${token()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const HELP_TEXT = `🪙 <b>Smart Birr</b> — your AI finance coach

<b>Keyboard</b>
📝 Log expense — step-by-step (category → amount → note)
📊 Budget · 📈 Report · ❓ Help

<b>Commands</b>
/start — Welcome
/budget — Monthly budget
/savings — Savings check
/report — Month summary
/cancel — Stop current expense entry

<b>Natural chat</b>
• Spent 500 birr on lunch
• Can I afford a laptop on 20k income?

<i>Times below use Ethiopia (Addis Ababa).</i>
🌅 ~7:00 — daily spending guide (AI)
🍽 ~13:00 — lunch check-in
🌙 ~21:00 — evening check-in`;

export const START_TEXT = `👋 Welcome to <b>Smart Birr</b>!

I'm your AI financial counselor for <b>ETB</b>.

Use the keyboard below to <b>log expenses</b> like the dashboard (category, amount, description), or chat naturally:
<i>Spent 300 birr on taxi</i>

Set income: <i>My income is 20000 birr</i>

Type /help for more.`;
