import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runMonthlyReportReminders } from "@/lib/cron/monthly-report-jobs";
import { runMonthlyTelegramAnalysis } from "@/lib/cron/telegram-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [telegram, reportReminders] = await Promise.all([
      runMonthlyTelegramAnalysis(),
      runMonthlyReportReminders(),
    ]);
    return NextResponse.json({
      ok: true,
      telegram,
      reportReminders,
    });
  } catch (e) {
    console.error("Monthly cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 },
    );
  }
}
