import { IntroRings } from "./intro-rings";

type Props = {
  exiting?: boolean;
};

/** Shared intro markup — used by SSR bootstrap and client IntroLoader */
export function IntroSplashView({ exiting = false }: Props) {
  return (
    <>
      <div className="intro-ambient intro-ambient--purple" />
      <div className="intro-ambient intro-ambient--emerald" />

      <div className={`intro-stage ${exiting ? "intro-stage--exit" : ""}`}>
        <IntroRings />

        <div className="intro-brand">
          <p className="intro-brand-name">
            <span className="intro-brand-word">Smart</span>
            <span className="intro-brand-word intro-brand-word--delay">
              Birr
            </span>
          </p>
          <p className="intro-brand-tag">AI financial guide for Ethiopia</p>
        </div>
      </div>

      <div className="intro-progress" aria-hidden>
        <span className="intro-progress-bar" />
      </div>
    </>
  );
}
