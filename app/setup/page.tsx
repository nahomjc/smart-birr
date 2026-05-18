import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { SetupForm } from "@/components/onboarding/setup-form";

export default async function SetupPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← Smart Birr
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Set up your account
        </h1>
        <p className="mt-2 text-zinc-500">
          Tell us your name and optional monthly income to personalize budgets
          and AI advice.
        </p>
        <div className="mt-8 text-left">
          <SetupForm />
        </div>
      </div>
    </div>
  );
}
