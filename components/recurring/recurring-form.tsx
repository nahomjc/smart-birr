"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { toDateKey } from "@/lib/finance/period";
import {
  addRecurring,
  type RecurringActionState,
} from "@/app/actions/recurring";
import { theme } from "@/lib/theme";

export function RecurringForm() {
  const [state, action, pending] = useActionState<
    RecurringActionState,
    FormData
  >(addRecurring, null);

  const defaultDue = toDateKey(new Date());

  return (
    <form
      key={state?.success ? "submitted" : "new"}
      action={action}
      className="grid gap-4 sm:grid-cols-2"
    >
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Amount (ETB)</span>
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          className={theme.input}
        />
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Category</span>
        <select name="category" defaultValue="Rent" className={theme.input}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Frequency</span>
        <select name="frequency" defaultValue="monthly" className={theme.input}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Next due date</span>
        <input
          name="nextDueAt"
          type="date"
          required
          defaultValue={defaultDue}
          className={theme.input}
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className={`mb-1 block ${theme.subtext}`}>Description</span>
        <input
          name="description"
          placeholder="e.g. Apartment rent"
          className={theme.input}
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400 sm:col-span-2">
          Recurring bill saved. It will auto-log as an expense when due.
        </p>
      )}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Saving…" : "Add recurring bill"}
      </Button>
    </form>
  );
}
