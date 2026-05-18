"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function AuthTabs() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div>
      <div className="mb-6 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "login"
              ? "bg-white shadow-sm dark:bg-zinc-800"
              : "text-zinc-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "signup"
              ? "bg-white shadow-sm dark:bg-zinc-800"
              : "text-zinc-500"
          }`}
        >
          Sign up
        </button>
      </div>
      {tab === "login" ? <LoginForm /> : <SignupForm />}
    </div>
  );
}
