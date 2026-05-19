"use client";

import { useLayoutEffect, useState } from "react";
import { IntroLoader } from "./intro-loader";

const HOLD_MS = 2600;
const HOLD_MS_REDUCED = 900;
const EXIT_MS = 620;
const EXIT_MS_REDUCED = 280;

type Phase = "playing" | "exiting" | "done";

function shouldSkipIntro(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("skip-intro");
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function removeBootstrapSplash(): void {
  document.getElementById("intro-bootstrap")?.remove();
}

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("playing");

  useLayoutEffect(() => {
    removeBootstrapSplash();

    if (shouldSkipIntro()) {
      setPhase("done");
      return;
    }

    const reduced = prefersReducedMotion();
    const holdMs = reduced ? HOLD_MS_REDUCED : HOLD_MS;
    const exitMs = reduced ? EXIT_MS_REDUCED : EXIT_MS;

    let cancelled = false;
    document.body.classList.add("intro-active");

    const exitTimer = window.setTimeout(() => {
      if (!cancelled) setPhase("exiting");
    }, holdMs);
    const doneTimer = window.setTimeout(() => {
      if (!cancelled) {
        document.body.classList.remove("intro-active");
        setPhase("done");
      }
    }, holdMs + exitMs);

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.classList.remove("intro-active");
    };
  }, []);

  const showLoader = phase === "playing" || phase === "exiting";

  return (
    <>
      {showLoader ? (
        <IntroLoader key={phase} exiting={phase === "exiting"} />
      ) : null}
      <div
        className="flex min-h-0 flex-1 flex-col"
        aria-hidden={showLoader || undefined}
        hidden={showLoader || undefined}
      >
        {children}
      </div>
    </>
  );
}
