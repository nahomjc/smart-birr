import type { listCampaigns } from "@/lib/campaigns/campaign-service";

type CampaignRow = Awaited<ReturnType<typeof listCampaigns>>[number];

function formatWhen(d: Date) {
  return new Date(d).toLocaleString("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function audienceLabel(a: string, count: number, recipientIds: string[] | null) {
  if (a === "with_email") return "Users with email";
  if (a === "selected") {
    const n = recipientIds?.length ?? count;
    return `Selected users (${n})`;
  }
  return "All users";
}

export function CampaignHistory({ campaigns }: { campaigns: CampaignRow[] }) {
  if (!campaigns.length) {
    return (
      <p className="text-sm text-zinc-500">No campaigns sent yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800/60">
      {campaigns.map((c) => (
        <li key={c.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-zinc-100">{c.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                {c.message}
              </p>
            </div>
            <time className="shrink-0 text-xs text-zinc-600">
              {formatWhen(c.createdAt)}
            </time>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-zinc-400">
              {audienceLabel(c.audience, c.recipientCount, c.recipientIds)}
            </span>
            {c.sendInApp && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400">
                In-app · {c.inAppSent}
              </span>
            )}
            {c.sendEmail && (
              <span className="rounded-md bg-sky-500/10 px-2 py-1 text-sky-400">
                Email · {c.emailSent} sent
                {c.emailFailed > 0 ? `, ${c.emailFailed} failed` : ""}
              </span>
            )}
            <span className="rounded-md bg-zinc-800/60 px-2 py-1 text-zinc-500">
              {c.recipientCount} recipients
            </span>
            {c.createdBy?.name && (
              <span className="text-zinc-600">by {c.createdBy.name}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
