import { NextResponse } from "next/server";
import { deleteWebhook, getWebhookInfo, setWebhook } from "@/lib/telegram/bot";

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
  const reset = await deleteWebhook(false);
  const result = await setWebhook(webhookUrl);
  const webhookInfo = await getWebhookInfo();
  const webhookSecretConfigured = !!process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const info = (webhookInfo as {
    result?: {
      url?: string;
      allowed_updates?: string[];
      pending_update_count?: number;
      last_error_date?: number;
      last_error_message?: string;
    };
  }).result;
  const allowedUpdates = info?.allowed_updates ?? [];

  return NextResponse.json({
    webhookUrl,
    reset,
    webhookSecretConfigured,
    result,
    webhookInfo,
    webhookUrlMatches: info?.url === webhookUrl,
    pendingUpdateCount: info?.pending_update_count ?? 0,
    lastErrorMessage: info?.last_error_message ?? null,
    callbackQueryEnabled: allowedUpdates.includes("callback_query"),
    hint: webhookSecretConfigured
      ? "Webhook secret registered with Telegram."
      : "Set TELEGRAM_WEBHOOK_SECRET in production and call setup again.",
    action:
      allowedUpdates.length > 0 && !allowedUpdates.includes("callback_query")
        ? "Re-run this setup URL — inline buttons need callback_query in allowed_updates."
        : undefined,
  });
}
