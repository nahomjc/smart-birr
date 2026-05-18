"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import {
  completeOnboarding,
  type ProfileActionState,
} from "@/app/actions/profile";

type Props = {
  defaultName?: string;
  defaultIncome?: string;
};

export function ProfileForm({ defaultName = "", defaultIncome = "" }: Props) {
  const [state, action, pending] = useActionState<
    ProfileActionState,
    FormData
  >(completeOnboarding, null);

  return (
    <form action={action} className="mx-auto max-w-md space-y-4">
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Your name</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          className={theme.input}
        />
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>
          Monthly income (ETB, optional)
        </span>
        <input
          name="income"
          type="number"
          min="0"
          defaultValue={defaultIncome}
          className={theme.input}
          placeholder="20000"
        />
      </label>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Continue to dashboard"}
      </Button>
    </form>
  );
}
