import Image from "next/image";
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand";

type Props = {
  exiting?: boolean;
};

/** Logo with electric glow / arc effect for the intro screen */
export function IntroLogo({ exiting = false }: Props) {
  return (
    <div
      className={`intro-logo-electrify ${exiting ? "intro-logo-electrify--exit" : ""}`}
      aria-hidden
    >
      <span className="intro-logo-arc intro-logo-arc--a" />
      <span className="intro-logo-arc intro-logo-arc--b" />
      <span className="intro-logo-glow" />
      <span className="intro-logo-spark intro-logo-spark--1" />
      <span className="intro-logo-spark intro-logo-spark--2" />
      <span className="intro-logo-spark intro-logo-spark--3" />
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_LOGO_ALT}
        width={720}
        height={400}
        priority
        className="intro-logo-image"
      />
    </div>
  );
}
