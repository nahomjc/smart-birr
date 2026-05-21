"use client";

import NextTopLoader from "nextjs-toploader";

/** Thin route-change progress bar fixed to the top of the viewport. */
export function RouteProgress() {
  return (
    <NextTopLoader
      color="var(--accent)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl
      showSpinner={false}
      easing="ease"
      speed={200}
      zIndex={1600}
      showAtBottom={false}
      shadow="0 0 12px color-mix(in srgb, var(--accent) 55%, transparent)"
    />
  );
}
