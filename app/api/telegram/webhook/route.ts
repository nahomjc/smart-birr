import { NextResponse } from "next/server";
import {
  answerCallbackQuery,
  resolveCallbackChatId,
  sendTelegramMessage,
  type TelegramUpdate,
} from "@/lib/telegram/bot";
import {
  handleTelegramCallback,
  handleTelegramMessage,
} from "@/lib/telegram/handler";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Smart Birr Telegram webhook is live. Telegram sends POST here; open /api/telegram/setup to register.",
  });
}

export async function POST(request: Request) {
  let pendingCallbackId: string | undefined;
  let pendingChatId: number | undefined;

  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    if (secret) {
      const header = request.headers.get("x-telegram-bot-api-secret-token");
      if (header !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        "TELEGRAM_WEBHOOK_SECRET is not set — webhook is open to unauthenticated POSTs",
      );
    }

    const update = (await request.json()) as TelegramUpdate;

    const callback = update.callback_query;
    if (callback?.data && callback.from) {
      const chatId = resolveCallbackChatId(callback);
      pendingCallbackId = callback.id;
      pendingChatId = chatId;

      await handleTelegramCallback(
        chatId,
        callback.from.id,
        callback.data,
        callback.id,
        callback.message?.message_id,
      );
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramId = message.from.id;
    await handleTelegramMessage(chatId, telegramId, message.text);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    if (pendingCallbackId) {
      await answerCallbackQuery(pendingCallbackId, "Something went wrong");
    }
    if (pendingChatId) {
      await sendTelegramMessage(
        pendingChatId,
        "⚠️ Something went wrong. Tap <b>📝 Log expense</b> to try again.",
        "HTML",
      );
    }
    return NextResponse.json({ ok: true });
  }
}
