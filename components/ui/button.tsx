import { type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-900/30",
  secondary:
    "border border-emerald-800/50 bg-[#0f1714] text-zinc-100 hover:border-emerald-600/40 hover:bg-emerald-950/40",
  ghost:
    "text-zinc-400 hover:bg-emerald-950/40 hover:text-emerald-300",
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
