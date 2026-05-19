import type { ReactNode } from "react";

type Variant = "spent" | "remaining" | "savings" | "recurring";

const variantStyles: Record<Variant, { value: string; accent: string }> = {
  spent: {
    value: "text-emerald-300",
    accent: "bg-emerald-500/[0.07]",
  },
  remaining: {
    value: "text-zinc-50",
    accent: "bg-white/[0.03]",
  },
  savings: {
    value: "text-zinc-50",
    accent: "bg-amber-500/[0.06]",
  },
  recurring: {
    value: "text-zinc-50",
    accent: "bg-sky-500/[0.06]",
  },
};

function CardChip() {
  return (
    <div
      className="relative h-9 w-11 shrink-0 overflow-hidden rounded-[6px] bg-gradient-to-br from-[#d4af37] via-[#c9a227] to-[#8b6914] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      aria-hidden
    >
      <div className="absolute inset-0 grid grid-cols-2 gap-[2px] p-[5px] opacity-35">
        {(["a", "b", "c", "d"] as const).map((id) => (
          <div key={id} className="rounded-[2px] bg-[#3d3010]/50" />
        ))}
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col items-end gap-1" aria-hidden>
      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Smart Birr
      </span>
      <span className="relative flex h-[18px] w-[30px]">
        <span className="absolute left-0 h-[18px] w-[18px] rounded-full bg-emerald-500" />
        <span className="absolute right-0 h-[18px] w-[18px] rounded-full bg-[#eb001b]/90" />
      </span>
    </div>
  );
}

export function MetricAtmCard({
  label,
  value,
  footnote,
  variant,
  badge,
  trailingLabel = "Debit",
}: {
  label: string;
  value: string;
  footnote?: string;
  variant: Variant;
  badge?: ReactNode;
  trailingLabel?: string;
}) {
  const styles = variantStyles[variant];

  return (
    <article
      className={`group relative aspect-[1.586/1] w-full min-h-[168px] max-h-[220px] overflow-hidden rounded-[20px] border border-white/[0.08] p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-12px_rgba(0,0,0,0.75)] ${styles.accent}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#0a0a0c]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.14] via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-14 h-44 w-60 -rotate-[22deg] bg-gradient-to-b from-white/[0.09] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/[0.07]"
        aria-hidden
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <CardChip />
          <BrandMark />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-1 py-2 text-center">
          {badge ? (
            <span className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {badge}
            </span>
          ) : null}
          <p
            className={`max-w-full font-mono text-lg font-semibold tracking-[0.08em] sm:text-xl md:text-2xl ${styles.value}`}
          >
            {value}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-white/[0.06] pt-3">
          <div className="min-w-0 text-left">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
              {label}
            </p>
            {footnote ? (
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-zinc-500">
                {footnote}
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            {trailingLabel}
          </p>
        </div>
      </div>
    </article>
  );
}
