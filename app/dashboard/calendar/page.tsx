import { FinanceCalendar } from "@/components/calendar/finance-calendar";
import { getCalendarMonthData } from "@/lib/data/calendar";
import { getSessionUserId } from "@/lib/auth/session";
import {
  parseCalendarMonth,
  parseCalendarSystem,
  toDateKey,
} from "@/lib/finance/period";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    year?: string;
    month?: string;
    ey?: string;
    em?: string;
    day?: string;
    cal?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const calendarSystem = parseCalendarSystem(params.cal);
  const period = parseCalendarMonth(params);
  const userId = await getSessionUserId();
  if (!userId) return null;

  let data = null;
  try {
    data = await getCalendarMonthData(
      period,
      params.day ?? toDateKey(new Date()),
      userId,
      calendarSystem,
    );
  } catch {
    /* DB unavailable */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Calendar</h1>
        <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
          See expenses, income, and recurring due dates by day. Budget totals
          at the top are for the whole month.
        </p>
      </div>
      {data ? (
        <FinanceCalendar data={data} />
      ) : (
        <p className={`text-sm ${theme.subtext}`}>
          Connect your database to use the calendar.
        </p>
      )}
    </div>
  );
}
