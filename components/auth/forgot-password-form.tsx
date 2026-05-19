"use client";

import { useActionState } from "react";
import { sendPasswordResetCode } from "@/app/actions/password-reset";
import type { AuthActionState } from "@/app/actions/auth";
import { authInput, authLabel, authSubmit } from "./auth-styles";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    sendPasswordResetCode,
    null,
  );

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-semibold text-white">Forgot password</h1>
      <p className="mt-2 text-sm text-white/70">
        Enter your email and we&apos;ll send a 6-digit verification code.
      </p>

      <form action={action} className="mt-6 space-y-4">
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
        {state?.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={authSubmit}>
          {pending ? "Sending code…" : "Send verification code"}
        </button>
      </form>
    </div>
  );
}
