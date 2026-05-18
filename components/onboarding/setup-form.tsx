"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createSession, type SessionActionState } from "@/app/actions/session";

export function SetupForm() {
  const [state, action, pending] = useActionState<
    SessionActionState,
    FormData
  >(createSession, null);

  return (
    <form action={action} className="mx-auto max-w-md space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Your name</span>
        <input
          name="name"
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Abebe"
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Setting up…" : "Start using Smart Birr"}
      </Button>
    </form>
  );
}
