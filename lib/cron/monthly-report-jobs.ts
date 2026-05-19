import { requireDb, users } from "@/lib/db";
import { formatPeriodLabel, getCurrentPeriod } from "@/lib/finance/period";
import { createNotification } from "@/lib/notifications/create-notification";

export async function runMonthlyReportReminders() {
  const db = requireDb();
  const period = getCurrentPeriod();
  const periodLabel = formatPeriodLabel(period.year, period.month);

  const allUsers = await db.query.users.findMany({
    columns: { id: true },
  });

  let notified = 0;
  for (const user of allUsers) {
    try {
      await createNotification(user.id, {
        type: "monthly_report_ready",
        title: "Monthly report ready",
        message: `Your ${periodLabel} financial report is ready. Download the Excel summary from your dashboard.`,
        meta: { year: period.year, month: period.month },
      });
      notified++;
    } catch (e) {
      console.error(`Monthly report reminder failed for user ${user.id}:`, e);
    }
  }

  return { users: allUsers.length, notificationsSent: notified };
}
