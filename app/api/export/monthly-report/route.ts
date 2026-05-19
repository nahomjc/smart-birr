import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { buildMonthlyReportXlsx } from "@/lib/export/build-monthly-xlsx";
import {
  getMonthlyReportData,
  monthlyReportFilename,
  parseReportPeriod,
} from "@/lib/export/monthly-report-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = parseReportPeriod(
      searchParams.get("year"),
      searchParams.get("month"),
    );

    const data = await getMonthlyReportData(userId, period);
    const buffer = await buildMonthlyReportXlsx(data);
    const filename = monthlyReportFilename(period);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Monthly report export failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 },
    );
  }
}
