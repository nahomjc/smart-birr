/** Spinning torus-style rings — SVG renders reliably vs CSS mask on empty divs */
export function IntroRings() {
  return (
    <div className="intro-ring-scene" aria-hidden>
      <svg
        className="intro-rings-svg"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <title>Smart Birr loading</title>
        <defs>
          <linearGradient
            id="intro-ring-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="25%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="75%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <radialGradient id="intro-core-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </radialGradient>
          <filter
            id="intro-ring-glow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="intro-rings-outer-spin">
          <ellipse
            cx="64"
            cy="64"
            rx="54"
            ry="20"
            stroke="url(#intro-ring-grad)"
            strokeWidth="7"
            opacity="0.45"
          />
        </g>

        <g className="intro-rings-inner-spin" filter="url(#intro-ring-glow)">
          <ellipse
            cx="64"
            cy="64"
            rx="38"
            ry="14"
            stroke="url(#intro-ring-grad)"
            strokeWidth="6"
          />
        </g>

        <circle
          cx="64"
          cy="64"
          r="5"
          fill="url(#intro-core-grad)"
          className="intro-rings-core"
        />
      </svg>
    </div>
  );
}
