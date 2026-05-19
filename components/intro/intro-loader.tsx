"use client";

import { IntroSplashView } from "./intro-splash-view";

type Props = {
  exiting: boolean;
};

export function IntroLoader({ exiting }: Props) {
  return (
    <div
      aria-hidden={exiting}
      aria-label="Loading Smart Birr"
      className={`intro-overlay ${exiting ? "intro-overlay--exit" : ""}`}
      role="presentation"
    >
      <IntroSplashView exiting={exiting} />
    </div>
  );
}
