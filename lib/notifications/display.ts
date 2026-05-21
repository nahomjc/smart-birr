import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  FileSpreadsheet,
  Moon,
  Sun,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

export function formatNotificationWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatNotificationDateGroup(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

type NotificationTypeMeta = {
  label: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
};

const TYPE_META: Record<string, NotificationTypeMeta> = {
  morning_guide: {
    label: "Morning guide",
    icon: Sun,
    accent: "text-amber-300",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  lunch_checkin: {
    label: "Lunch check-in",
    icon: UtensilsCrossed,
    accent: "text-orange-300",
    iconBg: "bg-orange-500/15 text-orange-300",
  },
  night_checkin: {
    label: "Evening check-in",
    icon: Moon,
    accent: "text-indigo-300",
    iconBg: "bg-indigo-500/15 text-indigo-300",
  },
  budget_danger: {
    label: "Budget alert",
    icon: AlertTriangle,
    accent: "text-rose-300",
    iconBg: "bg-rose-500/15 text-rose-300",
  },
  weekly_report: {
    label: "Weekly report",
    icon: TrendingUp,
    accent: "text-emerald-300",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  monthly_analysis: {
    label: "Monthly analysis",
    icon: Calendar,
    accent: "text-sky-300",
    iconBg: "bg-sky-500/15 text-sky-300",
  },
  monthly_report_ready: {
    label: "Report ready",
    icon: FileSpreadsheet,
    accent: "text-emerald-300",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  campaign: {
    label: "Announcement",
    icon: Bell,
    accent: "text-amber-300",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
};

const DEFAULT_META: NotificationTypeMeta = {
  label: "Update",
  icon: Bell,
  accent: "text-zinc-300",
  iconBg: "bg-emerald-500/15 text-emerald-300",
};

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return TYPE_META[type] ?? {
    ...DEFAULT_META,
    label: type.replace(/_/g, " "),
  };
}

export function groupNotificationsByDate<T extends { createdAt: string }>(
  items: T[],
): { label: string; items: T[] }[] {
  const order = ["Today", "Yesterday", "This week"];
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const label = formatNotificationDateGroup(item.createdAt);
    const list = buckets.get(label) ?? [];
    list.push(item);
    buckets.set(label, list);
  }

  const groups: { label: string; items: T[] }[] = [];
  for (const label of order) {
    const group = buckets.get(label);
    if (group?.length) groups.push({ label, items: group });
    buckets.delete(label);
  }

  for (const [label, group] of buckets) {
    if (group.length) groups.push({ label, items: group });
  }

  return groups;
}
