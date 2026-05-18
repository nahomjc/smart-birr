"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, type AuthActionState } from "@/app/actions/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signIn,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
