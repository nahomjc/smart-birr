import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI Financial Counselor",
    description:
      "Budgeting, savings plans, debt guidance, and beginner-friendly education in Amharic-friendly ETB context.",
  },
  {
    title: "Expense Tracking",
    description:
      'Log "Spent 500 birr on lunch" — AI extracts amount and category automatically.',
  },
  {
    title: "Budget Planner",
    description:
      "Income-based allocations for rent, food, transport, emergency fund, and savings.",
  },
  {
    title: "Telegram Bot",
    description:
      "Same intelligence on Telegram: /budget, /report, /savings, and natural chat.",
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
          Smart Birr 🪙
        </span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your AI-powered
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              financial guide
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Smart Birr helps Ethiopians budget in birr, track expenses, build
            savings, and get practical counsel — on the web or Telegram.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button className="px-8 py-3 text-base">Start free</Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="secondary" className="px-8 py-3 text-base">
                Talk to AI counselor
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {f.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h2 className="text-xl font-semibold">Stack</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Next.js · OpenRouter · Telegram · PostgreSQL · Drizzle · Vercel
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Configure{" "}
            <code className="rounded bg-white/80 px-1 dark:bg-zinc-900">
              .env.local
            </code>{" "}
            with DATABASE_URL, OPENROUTER_API_KEY, and TELEGRAM_BOT_TOKEN. Set
            webhook via{" "}
            <code className="rounded bg-white/80 px-1 dark:bg-zinc-900">
              GET /api/telegram/setup?key=YOUR_SETUP_KEY
            </code>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
