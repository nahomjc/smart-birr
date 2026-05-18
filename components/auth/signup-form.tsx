"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signUp, type AuthActionState } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signUp,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Name</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Abebe"
        />
      </label>
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
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">
          Monthly income (ETB, optional)
        </span>
        <input
          name="income"
          type="number"
          min="0"
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="20000"
        />
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
