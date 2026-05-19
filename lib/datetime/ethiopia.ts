export const ETHIOPIA_TIMEZONE = "Africa/Addis_Ababa";

export function formatEthiopiaNow(
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
): string {
  return new Date().toLocaleString("en-ET", {
    timeZone: ETHIOPIA_TIMEZONE,
    ...options,
  });
}

export function ethiopiaHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ETHIOPIA_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const hour = parts.find((p) => p.type === "hour")?.value;
  return hour ? Number(hour) : 0;
}
