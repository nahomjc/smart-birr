"use client";

import { useActionState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  saveBudgetSettings,
  suggestBudgetFromIncome,
  type SuggestedBudgetValues,
} from "@/app/actions/settings";
import type { BudgetSettingsData } from "@/lib/data/settings";
import { theme } from "@/lib/theme";

type Props = {
  initial: BudgetSettingsData;
};

function mergeWithSuggestion(
  initial: BudgetSettingsData,
  suggested: SuggestedBudgetValues | undefined,
): BudgetSettingsData {
  if (!suggested) return initial;
  return {
    ...initial,
    monthlyIncome: suggested.monthlyIncome,
    savingsGoal: suggested.savingsGoal,
    emergencyFund: suggested.emergencyFund,
    categoryLimits: suggested.categoryLimits,
  };
}

export function BudgetSettingsForm({ initial }: Props) {
  const [saveState, saveAction, savePending] = useActionState(
    saveBudgetSettings,
    null,
  );
  const [suggestState, suggestAction, suggestPending] = useActionState(
    suggestBudgetFromIncome,
    null,
  );

  const values = useMemo(
    () => mergeWithSuggestion(initial, suggestState?.suggested),
    [initial, suggestState?.suggested],
  );

  const formKey = suggestState?.suggested
    ? `suggested-${suggestState.suggested.monthlyIncome}`
    : "default";

  const error = saveState?.error ?? suggestState?.error;

  return (
    <div className="space-y-6">
      <Card>
        <form key={formKey} action={saveAction} className="space-y-6">
          <p className={`text-sm ${theme.subtext}`}>
            Set your own limits for {values.periodLabel}. These values are used
            for budget alerts on Overview and when you log expenses.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className={`mb-1 block ${theme.subtext}`}>
                Monthly income (ETB)
              </span>
              <input
                name="monthlyIncome"
                type="number"
                min="1"
                required
                defaultValue={values.monthlyIncome}
                className={theme.input}
              />
            </label>
            <label className="block text-sm">
              <span className={`mb-1 block ${theme.subtext}`}>
                Savings goal (ETB)
              </span>
              <input
                name="savingsGoal"
                type="number"
                min="0"
                defaultValue={values.savingsGoal}
                className={theme.input}
              />
            </label>
            <label className="block text-sm">
              <span className={`mb-1 block ${theme.subtext}`}>
                Emergency fund (ETB)
              </span>
              <input
                name="emergencyFund"
                type="number"
                min="0"
                defaultValue={values.emergencyFund}
                className={theme.input}
              />
            </label>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-100">
              Expense limits (per category)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.categoryLimits.map((row) => (
                <label key={row.name} className="block text-sm">
                  <span className={`mb-1 block ${theme.subtext}`}>
                    {row.name}
                  </span>
                  <input
                    name={`limit_${row.name}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    defaultValue={row.limit}
                    className={theme.input}
                  />
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {saveState?.success && (
            <p className="text-sm text-emerald-400">Budget settings saved.</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={savePending}>
              {savePending ? "Saving…" : "Save budget settings"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <p className={`mb-3 text-sm ${theme.subtext}`}>
          Optional: fill limits from a suggested split based on income (you can
          edit every number before saving).
        </p>
        <form action={suggestAction} className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className={`mb-1 block ${theme.subtext}`}>Income (ETB)</span>
            <input
              name="monthlyIncome"
              type="number"
              min="1"
              required
              defaultValue={values.monthlyIncome}
              className={`max-w-xs ${theme.input}`}
            />
          </label>
          <Button type="submit" variant="secondary" disabled={suggestPending}>
            {suggestPending ? "Suggesting…" : "Suggest amounts"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
