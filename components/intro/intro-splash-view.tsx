import { IntroLogo } from "./intro-logo";

type Props = {
  exiting?: boolean;
};

/** Shared intro markup — used by client IntroLoader */
export function IntroSplashView({ exiting = false }: Props) {
  return (
    <>
      <div className="intro-ambient intro-ambient--primary" />
      <div className="intro-ambient intro-ambient--secondary" />

      <div className={`intro-stage ${exiting ? "intro-stage--exit" : ""}`}>
        <IntroLogo exiting={exiting} />
        <p className="intro-brand-tag">AI financial guide for Ethiopia</p>
      </div>

      <div className="intro-progress" aria-hidden>
        <span className="intro-progress-bar" />
      </div>
    </>
  );
}
