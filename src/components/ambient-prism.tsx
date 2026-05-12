export function AmbientPrism() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Hot amber/white core — what reads as "light" */}
          <linearGradient id="prism-core" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3a1500" stopOpacity="0" />
            <stop offset="18%" stopColor="#ff6b1a" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ffe9c2" stopOpacity="0.95" />
            <stop offset="78%" stopColor="#ffae3a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </linearGradient>

          {/* Prism edge — tight rainbow on the trailing side of the arc */}
          <linearGradient id="prism-edge" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3b30" stopOpacity="0" />
            <stop offset="14%" stopColor="#ff3b30" />
            <stop offset="28%" stopColor="#ff9500" />
            <stop offset="40%" stopColor="#ffcc00" />
            <stop offset="52%" stopColor="#34c759" />
            <stop offset="66%" stopColor="#5ac8fa" />
            <stop offset="80%" stopColor="#5856d6" />
            <stop offset="92%" stopColor="#af52de" />
            <stop offset="100%" stopColor="#af52de" stopOpacity="0" />
          </linearGradient>

          <filter
            id="prism-bloom-core"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="60" />
          </filter>
          <filter
            id="prism-bloom-edge"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Screen-blend keeps the hue pure against #08090b without lifting blacks. */}
        <g style={{ mixBlendMode: "screen" }}>
          {/* Primary arc — sweeps top-right → bottom-left, off-canvas at both ends */}
          <path
            d="M -300,1320 Q 820,360 2240,-220"
            stroke="url(#prism-core)"
            strokeWidth="320"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-core)"
            opacity="0.55"
          />
          <path
            d="M -300,1320 Q 820,360 2240,-220"
            stroke="url(#prism-edge)"
            strokeWidth="60"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-edge)"
            opacity="0.45"
          />

          {/* Quiet echo arc, lower-left — gives the spectrum a second beat */}
          <path
            d="M -200,1180 Q 380,820 1100,1180"
            stroke="url(#prism-core)"
            strokeWidth="200"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-core)"
            opacity="0.32"
          />
          <path
            d="M -200,1180 Q 380,820 1100,1180"
            stroke="url(#prism-edge)"
            strokeWidth="34"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-edge)"
            opacity="0.28"
          />
        </g>
      </svg>
    </div>
  );
}
