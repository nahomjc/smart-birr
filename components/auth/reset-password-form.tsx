"use client";

import { useActionState } from "react";
import {
  confirmPasswordReset,
  resendPasswordResetCode,
} from "@/app/actions/password-reset";
import type { AuthActionState } from "@/app/actions/auth";
import { authInput, authLabel, authSubmit } from "./auth-styles";
import { PasswordInput } from "./password-input";

type Props = {
  email: string;
  justSent?: boolean;
};

export function ResetPasswordForm({ email, justSent }: Props) {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    confirmPasswordReset,
    null,
  );
  const [resendState, resendAction, resendPending] = useActionState<
    AuthActionState,
    FormData
  >(resendPasswordResetCode, null);

  const passwordId = "reset-password";
  const confirmId = "reset-password-confirm";

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-semibold text-white">Reset password</h1>
      <p className="mt-2 text-sm text-white/70">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-white">{email}</span> and choose a new
        password.
      </p>

      {(justSent || resendState?.message) && (
        <p className="mt-4 rounded-lg bg-emerald-500/30 px-3 py-2 text-sm text-emerald-50">
          {resendState?.message ??
            "Verification code sent. Check your inbox (and spam)."}
        </p>
      )}

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="email" value={email} />
        <label className="block">
          <span className={authLabel}>Verification code</span>
          <input
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="123456"
            className={`${authInput} tracking-[0.3em]`}
          />
        </label>
        <label htmlFor={passwordId} className="block">
          <span className={authLabel}>New password</span>
          <PasswordInput
            id={passwordId}
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
          />
        </label>
        <label htmlFor={confirmId} className="block">
          <span className={authLabel}>Confirm password</span>
          <PasswordInput
            id={confirmId}
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Repeat password"
          />
        </label>
        {state?.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={authSubmit}>
          {pending ? "Updating…" : "Reset password"}
        </button>
      </form>

      <form action={resendAction} className="mt-4">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resendPending}
          className="w-full text-center text-sm text-white/80 underline-offset-2 hover:text-white hover:underline disabled:opacity-50"
        >
          {resendPending ? "Resending…" : "Resend code"}
        </button>
        {resendState?.error && (
          <p className="mt-2 text-center text-sm text-red-200">
            {resendState.error}
          </p>
        )}
      </form>
    </div>
  );
}
