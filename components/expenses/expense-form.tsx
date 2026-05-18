"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { addExpense, type ExpenseActionState } from "@/app/actions/expenses";
import { theme } from "@/lib/theme";

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
        <span className={`mb-1 block ${theme.subtext}`}>Amount (ETB)</span>
        <input name="amount" type="number" min="1" required className={theme.input} />
      </label>
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Category</span>
        <select name="category" defaultValue="Food" className={theme.input}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className={`mb-1 block ${theme.subtext}`}>Description</span>
        <input name="description" placeholder="Optional note" className={theme.input} />
      </label>
      {state?.error && (
        <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400 sm:col-span-2">Expense saved.</p>
      )}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Saving…" : "Add expense"}
      </Button>
    </form>
  );
}
