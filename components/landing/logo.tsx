import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand";

export function Logo({
  className = "",
  href = "/",
  size = "header",
}: {
  className?: string;
  /** Set to `null` to render without a link */
  href?: string | null;
  size?: "header" | "footer";
}) {
  const isHeader = size === "header";

  const content = isHeader ? (
    <span className="relative block h-14 w-[11rem] shrink-0 sm:h-16 sm:w-[13rem]">
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_LOGO_ALT}
        fill
        priority
        sizes="(max-width: 640px) 176px, 208px"
        className="object-contain object-left"
      />
    </span>
  ) : (
    <Image
      src={BRAND_LOGO_PATH}
      alt={BRAND_LOGO_ALT}
      width={520}
      height={280}
      className="h-12 w-auto max-w-[13rem] object-contain sm:h-14 sm:max-w-[15rem]"
    />
  );

  const layoutClass = `inline-flex shrink-0 items-center ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${layoutClass} transition-opacity hover:opacity-90`}
      >
        {content}
      </Link>
    );
  }

  return <div className={layoutClass}>{content}</div>;
}
