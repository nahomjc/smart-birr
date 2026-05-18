"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { addExpense, type ExpenseActionState } from "@/app/actions/expenses";

export function ExpenseForm() {
  const [state, action, pending] = useActionState<
    ExpenseActionState,
    FormData
  >(addExpense, null);

  return (
    <form
      key={state?.success ? "submitted" : "new"}
      action={action}
      className="grid gap-4 sm:grid-cols-2"
    >
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Amount (ETB)</span>
        <input
          name="amount"
          type="number"
          min="1"
          required
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">Category</span>
        <select
          name="category"
          defaultValue="Food"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-zinc-500">Description</span>
        <input
          name="description"
          placeholder="Optional note"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600 sm:col-span-2">Expense saved.</p>
      )}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Saving…" : "Add expense"}
      </Button>
    </form>
  );
}
