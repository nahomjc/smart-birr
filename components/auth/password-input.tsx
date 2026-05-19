"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authInput } from "./auth-styles";

type PasswordInputProps = {
  id?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
};

export function PasswordInput({
  id,
  name = "password",
  required,
  minLength,
  autoComplete,
  placeholder,
}: PasswordInputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${authInput} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
