import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runWeeklyTelegramReports } from "@/lib/cron/telegram-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWeeklyTelegramReports();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("Weekly cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 },
    );
  }
}
