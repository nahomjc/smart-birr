import Link from "next/link";

export function Logo({
  className = "",
  light = true,
  href = "/",
}: {
  className?: string;
  light?: boolean;
  /** Set to `null` to render without a link */
  href?: string | null;
}) {
  const content = (
    <>
      <div className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rotate-12 rounded-lg bg-gradient-to-br from-emerald-400 via-lime-400 to-teal-500 opacity-90" />
        <span className="absolute inset-0 -rotate-6 rounded-lg bg-gradient-to-tr from-green-300 to-emerald-600 opacity-80" />
        <span className="relative h-4 w-4 rounded-sm bg-white/90 shadow-sm" />
      </div>
      <span
        className={`text-lg font-semibold tracking-tight ${light ? "text-white" : "text-zinc-100"}`}
      >
        Smart Birr
      </span>
    </>
  );

  const layoutClass = `flex items-center gap-2.5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${layoutClass} transition-opacity hover:opacity-90`}>
        {content}
      </Link>
    );
  }

  return <div className={layoutClass}>{content}</div>;
}
