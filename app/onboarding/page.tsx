import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/users/service";
import { ProfileForm } from "@/components/onboarding/profile-form";

export default async function OnboardingPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await getUserById(userId);
  if (user?.income && user?.name) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-lg text-center">
        <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Complete your profile
        </h1>
        <p className="mt-2 text-zinc-500">
          Add your name and income so Smart Birr can personalize budgets and AI
          advice.
        </p>
        <div className="mt-8 text-left">
          <ProfileForm
            defaultName={user?.name ?? ""}
            defaultIncome={user?.income ? String(user.income) : ""}
          />
        </div>
      </div>
    </div>
  );
}
