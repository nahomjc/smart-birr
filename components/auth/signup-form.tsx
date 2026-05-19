"use client";

import { useActionState, useId } from "react";
import { signUp, type AuthActionState } from "@/app/actions/auth";
import { authInput, authLabel, authSubmit } from "./auth-styles";
import { PasswordInput } from "./password-input";
import { SocialButtons } from "./social-buttons";

export function SignupForm() {
  const passwordId = useId();
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signUp,
    null,
  );

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-sm text-white/70">Create your Smart Birr account</p>

      <form action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className={authLabel}>Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Abebe"
            className={authInput}
          />
        </label>
        <label className="block">
          <span className={authLabel}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={authInput}
          />
        </label>
        <label htmlFor={passwordId} className="block">
          <span className={authLabel}>Password</span>
          <PasswordInput
            id={passwordId}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
          />
        </label>
        <label className="block">
          <span className={authLabel}>Monthly income (ETB, optional)</span>
          <input
            name="income"
            type="number"
            min="0"
            placeholder="20000"
            className={authInput}
          />
        </label>
        {state?.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {state.error}
          </p>
        )}
        {state?.message && (
          <p className="rounded-lg bg-emerald-500/30 px-3 py-2 text-sm text-emerald-50">
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className={authSubmit}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <SocialButtons />
    </div>
  );
}
