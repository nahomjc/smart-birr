"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createGoal, type PlanningActionState } from "@/app/actions/planning";
import { theme } from "@/lib/theme";

export function PlanningGoalForm() {
  const [state, action, pending] = useActionState<
    PlanningActionState,
    FormData
  >(createGoal, null);

  return (
    <form
      key={state?.success ? "submitted" : "new"}
      action={action}
      className="grid gap-4 sm:grid-cols-2"
    >
      <label className="block text-sm sm:col-span-2">
        <span className={`mb-1 block ${theme.subtext}`}>What are you saving for?</span>
        <input
          name="title"
          required
          placeholder="e.g. Laptop"
          className={theme.input}
        />
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Target amount (ETB)</span>
        <input
          name="targetAmount"
          type="number"
          min="1"
          required
          className={theme.input}
        />
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Target date (optional)</span>
        <input name="targetDate" type="date" className={theme.input} />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className={`mb-1 block ${theme.subtext}`}>Notes (optional)</span>
        <input
          name="description"
          placeholder="Model, link, or reminder"
          className={theme.input}
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400 sm:col-span-2">Goal created.</p>
      )}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Saving…" : "Add goal"}
      </Button>
    </form>
  );
}
