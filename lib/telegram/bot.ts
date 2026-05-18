const TELEGRAM_API = "https://api.telegram.org/bot";

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number };
    text?: string;
  };
};

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return t;
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
) {
  const res = await fetch(`${TELEGRAM_API}${token()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096),
      parse_mode: parseMode,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram sendMessage failed:", err);
  }
}

export async function setWebhook(url: string) {
  const res = await fetch(`${TELEGRAM_API}${token()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowed_updates: ["message"] }),
  });
  return res.json();
}

export const HELP_TEXT = `🪙 <b>Smart Birr</b> — your AI finance coach

<b>Commands</b>
/start — Welcome & setup
/help — This message
/budget — View or create your monthly budget
/savings — Savings tips & goal check
/report — This month's spending summary
/expense — How to log expenses

<b>Natural chat</b>
Just message me like a friend:
• Spent 500 birr on lunch
• Help me save 5000 birr
• Can I afford a car on 20k income?
• Make me a monthly budget`;

export const START_TEXT = `👋 Welcome to <b>Smart Birr</b>!

I'm your AI financial counselor for Ethiopian Birr (ETB).

Tell me your monthly income to get a personalized budget, or log spending:
<i>Spent 300 birr on taxi</i>

Type /help for commands.`;
