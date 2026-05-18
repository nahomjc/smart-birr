import Link from "next/link";
import { Suspense } from "react";
import { AuthTabs } from "@/components/auth/auth-tabs";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← Smart Birr
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in or create an account to track expenses and chat with your AI
          counselor.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-zinc-400">Loading…</p>}>
          <AuthError searchParams={searchParams} />
          <div className="mt-8">
            <AuthTabs />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params.error) return null;
  return (
    <p className="mt-4 text-sm text-red-600">
      Authentication failed. Please try again.
    </p>
  );
}
