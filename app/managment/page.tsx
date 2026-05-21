import { ManagementUsersTable } from "@/components/management/management-users-table";
import { getAdminUsersOverview } from "@/lib/data/admin-users";

export const dynamic = "force-dynamic";

export default async function ManagementUsersPage() {
  let overview: Awaited<ReturnType<typeof getAdminUsersOverview>> | null = null;
  try {
    overview = await getAdminUsersOverview();
  } catch {
    /* DB unavailable */
  }

  if (!overview) {
    return (
      <div className="rounded-xl border border-red-900/30 bg-red-950/20 px-6 py-8">
        <h1 className="text-lg font-semibold text-red-200">Connection error</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Could not load user data. Check DATABASE_URL and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Overview for {overview.periodLabel} — budgets, monthly spending, and
          active recurring schedules across all accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={String(overview.totalUsers)} />
        <StatCard
          label="With budget"
          value={String(overview.withBudgetThisMonth)}
          accent="emerald"
        />
        <StatCard
          label="Without budget"
          value={String(
            overview.totalUsers - overview.withBudgetThisMonth,
          )}
        />
        <StatCard label="Reporting period" value={overview.periodLabel} small />
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Directory
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              {overview.rows.length} records · sorted by newest first
            </p>
          </div>
        </div>
        <ManagementUsersTable rows={overview.rows} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: "emerald";
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-[#0c1014]/90 p-5 shadow-lg shadow-black/10">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold tracking-tight text-zinc-100 ${
          small ? "text-base" : "text-2xl"
        } ${accent === "emerald" ? "text-emerald-400" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
