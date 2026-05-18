"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthActionState } from "@/app/actions/auth";
import { authInput, authLabel, authSubmit } from "./auth-styles";
import { SocialButtons } from "./social-buttons";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signIn,
    null,
  );

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-sm text-white/70">Please enter your account details</p>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="next" value={next} />
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
        <label className="block">
          <span className={authLabel}>Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={authInput}
          />
        </label>
        <div className="flex justify-end">
          <a
            href="mailto:support@smartbirr.app"
            className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline"
          >
            Forgot Password
          </a>
        </div>
        {state?.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={authSubmit}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <SocialButtons />
    </div>
  );
}
