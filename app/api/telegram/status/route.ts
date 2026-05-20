import { NextResponse } from "next/server";
import {
  buildWebhookUrl,
  ensureWebhookSupportsCallbacks,
  getWebhookInfo,
} from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

/** GET /api/telegram/status?key=... — webhook diagnostics */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const setupKey = process.env.TELEGRAM_SETUP_KEY;

  if (process.env.NODE_ENV === "production" && setupKey && key !== setupKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhookUrl = buildWebhookUrl();
  const webhookInfo = await getWebhookInfo();
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
  const callbackQueryEnabled =
    allowedUpdates.length === 0 || allowedUpdates.includes("callback_query");

  return NextResponse.json({
    expectedWebhookUrl: webhookUrl,
    webhookUrlMatches: info?.url === webhookUrl,
    callbackQueryEnabled,
    allowedUpdates,
    pendingUpdateCount: info?.pending_update_count ?? 0,
    lastErrorMessage: info?.last_error_message ?? null,
    webhookInfo,
    fixHint:
      !callbackQueryEnabled || info?.url !== webhookUrl
        ? "Call GET /api/telegram/setup?key=YOUR_KEY to force re-register"
        : "Webhook looks correct — send a NEW Log expense message, then tap inline Food",
  });
}

/** POST /api/telegram/status?key=... — force webhook repair */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const setupKey = process.env.TELEGRAM_SETUP_KEY;

  if (process.env.NODE_ENV === "production" && setupKey && key !== setupKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const repair = await ensureWebhookSupportsCallbacks({ force: true });
  const webhookInfo = await getWebhookInfo();

  return NextResponse.json({ repair, webhookInfo });
}
