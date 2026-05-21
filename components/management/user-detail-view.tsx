import Link from "next/link";
import { UserRoleForm } from "@/components/management/user-role-form";
import { formatBirr } from "@/lib/data/admin-users";
import type { AdminUserDetail } from "@/lib/data/admin-user-detail";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800/70 bg-[#0c1014]/90 p-6 shadow-lg shadow-black/10">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function UserDetailView({ data }: { data: AdminUserDetail }) {
  const { user, periodLabel } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/managment"
            className="text-sm text-zinc-500 transition hover:text-amber-400"
          >
            ← Back to users
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
            {user.name ?? "Unnamed user"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {user.email ?? "No email"} · Data for {periodLabel}
          </p>
        </div>
        <span
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            user.isAdmin
              ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
              : "bg-zinc-800/80 text-zinc-400"
          }`}
        >
          {user.roleLabel}
        </span>
      </div>

      <Section title="Account & role">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs text-zinc-600">User ID</dt>
            <dd className="mt-0.5 font-mono text-xs text-zinc-400 break-all">
              {user.id}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600">Joined</dt>
            <dd className="mt-0.5 text-zinc-200">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600">Currency</dt>
            <dd className="mt-0.5 text-zinc-200">{user.currency}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600">Telegram</dt>
            <dd className="mt-0.5 text-zinc-200">
              {user.telegramId != null ? `Linked (${user.telegramId})` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600">Profile income</dt>
            <dd className="mt-0.5 text-zinc-200">
              {user.profileIncome != null
                ? formatBirr(user.profileIncome)
                : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-zinc-800/60 pt-6">
          <UserRoleForm userId={user.id} currentRole={user.appRole} />
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Income (this month)">
          <p className="text-2xl font-semibold text-emerald-400">
            {formatBirr(data.loggedIncomeTotal)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {data.incomeEntries.length} logged entr
            {data.incomeEntries.length === 1 ? "y" : "ies"}
          </p>
          {data.incomeEntries.length > 0 ? (
            <ul className="mt-4 divide-y divide-zinc-800/50">
              {data.incomeEntries.map((e) => (
                <li
                  key={e.id}
                  className="flex justify-between gap-2 py-2 text-sm"
                >
                  <span className="text-zinc-300">{e.source}</span>
                  <span className="shrink-0 text-emerald-400">
                    +{formatBirr(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No income logged.</p>
          )}
        </Section>

        <Section title={`Budget (${periodLabel})`}>
          {data.budget ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-zinc-500">Monthly income </span>
                <span className="font-semibold text-emerald-400">
                  {formatBirr(data.budget.monthlyIncome)}
                </span>
              </p>
              <p>
                <span className="text-zinc-500">Savings goal </span>
                <span className="text-zinc-200">
                  {formatBirr(data.budget.savingsGoal)}
                </span>
              </p>
              {Object.entries(data.budget.categoryLimits).length > 0 && (
                <ul className="divide-y divide-zinc-800/50">
                  {Object.entries(data.budget.categoryLimits).map(
                    ([name, limit]) => (
                      <li
                        key={name}
                        className="flex justify-between py-2 text-zinc-300"
                      >
                        <span>{name}</span>
                        <span>{formatBirr(limit)}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No budget for this month.</p>
          )}
        </Section>
      </div>

      <Section title={`Expenses (${periodLabel})`}>
        <p className="text-lg font-semibold text-zinc-100">
          {formatBirr(data.monthExpenseTotal)}{" "}
          <span className="text-sm font-normal text-zinc-500">
            · {data.expenses.length} transactions
          </span>
        </p>
        {data.expenses.length > 0 ? (
          <ul className="mt-4 divide-y divide-zinc-800/50">
            {data.expenses.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-200">{e.category}</p>
                  {e.description && (
                    <p className="text-xs text-zinc-500">{e.description}</p>
                  )}
                  <p className="text-xs text-zinc-600">
                    {formatDateTime(e.date)}
                  </p>
                </div>
                <span className="font-medium text-red-300/90">
                  {formatBirr(e.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No expenses this month.</p>
        )}
      </Section>

      <Section title="Recurring bills">
        {data.recurringAll.length === 0 ? (
          <p className="text-sm text-zinc-500">No recurring schedules.</p>
        ) : (
          <ul className="divide-y divide-zinc-800/50">
            {data.recurringAll.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-200">
                    {r.category}
                    {!r.isActive && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (paused)
                      </span>
                    )}
                  </p>
                  {r.description && (
                    <p className="text-xs text-zinc-500">{r.description}</p>
                  )}
                  <p className="text-xs text-zinc-600">
                    {r.frequency} · next {formatDate(r.nextDueAt)}
                  </p>
                </div>
                <span className="text-zinc-300">{formatBirr(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-zinc-600">
          {data.recurringActive.length} active of {data.recurringAll.length}{" "}
          total
        </p>
      </Section>

      <Section title="Planning goals">
        {data.planningGoals.length === 0 ? (
          <p className="text-sm text-zinc-500">No planning goals.</p>
        ) : (
          <ul className="space-y-4">
            {data.planningGoals.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-zinc-100">{g.title}</p>
                  <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-xs capitalize text-zinc-400">
                    {g.status}
                  </span>
                </div>
                {g.description && (
                  <p className="mt-1 text-sm text-zinc-500">{g.description}</p>
                )}
                <p className="mt-2 text-sm text-zinc-400">
                  Target {formatBirr(g.targetAmount)} · saved{" "}
                  {formatBirr(g.progress.savedTotal)} ({g.progress.percent}%)
                </p>
                {g.targetDate && (
                  <p className="mt-1 text-xs text-zinc-600">
                    Target date {formatDate(g.targetDate)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
