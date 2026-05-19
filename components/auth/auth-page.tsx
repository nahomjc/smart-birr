"use client";

import { Suspense, useState } from "react";
import { Logo } from "@/components/landing/logo";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { AuthPromo } from "./auth-promo";

type Mode = "login" | "signup";

export function AuthPage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex min-h-screen flex-col bg-[#071210] px-6 py-8 sm:px-10 lg:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(52,211,153,0.18),transparent_70%)]"
        />

        <Logo className="relative z-10" />

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {error && (
            <p className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-center text-sm text-red-100">
              {message ?? "Authentication failed. Please try again."}
            </p>
          )}

          <Suspense fallback={<p className="text-white/60">Loading…</p>}>
            {mode === "login" ? <LoginForm /> : <SignupForm />}
          </Suspense>

          <p className="mt-10 text-center text-sm text-white/70">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-white underline underline-offset-2 hover:text-emerald-300"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-white underline underline-offset-2 hover:text-emerald-300"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      <AuthPromo />
    </div>
  );
}
