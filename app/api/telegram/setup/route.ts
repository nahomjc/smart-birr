import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

/** GET /api/telegram/setup — registers webhook (protect in production) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const setupKey = process.env.TELEGRAM_SETUP_KEY;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !setupKey) {
    return NextResponse.json(
      { error: "Set TELEGRAM_SETUP_KEY in production before calling this route" },
      { status: 403 },
    );
  }
  if (setupKey && key !== setupKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null);

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Set NEXT_PUBLIC_APP_URL or deploy to Vercel" },
      { status: 400 },
    );
  }

  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;
  const result = await setWebhook(webhookUrl);
  const webhookSecretConfigured = !!process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  return NextResponse.json({
    webhookUrl,
    webhookSecretConfigured,
    result,
    hint: webhookSecretConfigured
      ? "Webhook secret registered with Telegram."
      : "Set TELEGRAM_WEBHOOK_SECRET in production and call setup again.",
  });
}
