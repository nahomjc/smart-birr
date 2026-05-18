import { type ReactNode } from "react";
import { theme } from "@/lib/theme";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${theme.card} ${className}`}>{children}</div>
  );
}
