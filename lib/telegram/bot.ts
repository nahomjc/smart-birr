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
    message?: { message_id: number; chat: { id: number } };
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
): Promise<boolean> {
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
    return false;
  }
  return true;
}

export async function editTelegramMessageReplyMarkup(
  chatId: number,
  messageId: number,
): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}${token()}/editMessageReplyMarkup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram editMessageReplyMarkup failed:", err);
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

export async function getWebhookInfo() {
  const res = await fetch(`${TELEGRAM_API}${token()}/getWebhookInfo`);
  return res.json();
}

export function resolveCallbackChatId(callback: {
  from: { id: number };
  message?: { chat: { id: number } };
}): number {
  return callback.message?.chat.id ?? callback.from.id;
}

/** Public app URL used for webhook registration (must match where Vercel serves the bot). */
export function resolveWebhookBaseUrl(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  return raw ? raw.replace(/\/$/, "") : null;
}

export function buildWebhookUrl(): string | null {
  const base = resolveWebhookBaseUrl();
  return base ? `${base}/api/telegram/webhook` : null;
}

function callbacksAllowed(allowedUpdates: string[] | undefined): boolean {
  if (!allowedUpdates || allowedUpdates.length === 0) return true;
  return allowedUpdates.includes("callback_query");
}

export async function setWebhook(url: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: Record<string, unknown> = {
    url,
    // Empty list = receive all update types (incl. callback_query for inline buttons).
    allowed_updates: [],
    drop_pending_updates: true,
  };
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

/** Re-register webhook when inline buttons would not deliver callback_query updates. */
export async function ensureWebhookSupportsCallbacks(options?: {
  force?: boolean;
}): Promise<{
  fixed: boolean;
  webhookUrl: string | null;
  reason?: string;
}> {
  const webhookUrl = buildWebhookUrl();
  if (!webhookUrl) {
    return { fixed: false, webhookUrl: null, reason: "NEXT_PUBLIC_APP_URL not set" };
  }

  const info = (await getWebhookInfo()) as {
    result?: { url?: string; allowed_updates?: string[] };
  };
  const currentUrl = info.result?.url ?? "";
  const allowed = info.result?.allowed_updates;
  const urlOk = currentUrl === webhookUrl;
  const callbacksOk = callbacksAllowed(allowed);

  if (!options?.force && urlOk && callbacksOk) {
    return { fixed: false, webhookUrl, reason: "already ok" };
  }

  console.warn("[telegram] webhook repair", {
    force: !!options?.force,
    expected: webhookUrl,
    current: currentUrl,
    allowed_updates: allowed ?? [],
    urlOk,
    callbacksOk,
  });

  await deleteWebhook(true);
  const result = await setWebhook(webhookUrl);
  const ok = !!(result as { ok?: boolean }).ok;
  return {
    fixed: ok,
    webhookUrl,
    reason: ok
      ? options?.force
        ? "force re-registered"
        : `re-registered (urlOk=${urlOk}, callbacksOk=${callbacksOk})`
      : JSON.stringify(result),
  };
}

export async function deleteWebhook(dropPendingUpdates = false) {
  const res = await fetch(`${TELEGRAM_API}${token()}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drop_pending_updates: dropPendingUpdates }),
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
