import { NextResponse } from "next/server";
import type { TelegramUpdate } from "@/lib/telegram/bot";
import { handleTelegramMessage } from "@/lib/telegram/handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const header = request.headers.get("x-telegram-bot-api-secret-token");
      if (header !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramId = message.from.id;
    const name =
      message.from.first_name ??
      message.from.username ??
      "Telegram User";

    await handleTelegramMessage(
      chatId,
      telegramId,
      message.text,
      name,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
