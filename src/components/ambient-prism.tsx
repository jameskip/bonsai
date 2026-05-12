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
          {/* Hot core — warm white blowing out to amber. Runs along the arc. */}
          <linearGradient id="prism-core" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffb24a" stopOpacity="0" />
            <stop offset="22%" stopColor="#ff8c2a" stopOpacity="0.85" />
            <stop offset="48%" stopColor="#fff1c4" stopOpacity="1" />
            <stop offset="72%" stopColor="#ffa84a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff3b00" stopOpacity="0" />
          </linearGradient>

          {/* Tight saturated rainbow — sits along the arc as the prismatic edge */}
          <linearGradient id="prism-edge" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#af52de" stopOpacity="0" />
            <stop offset="8%" stopColor="#af52de" />
            <stop offset="22%" stopColor="#5856d6" />
            <stop offset="36%" stopColor="#5ac8fa" />
            <stop offset="50%" stopColor="#34c759" />
            <stop offset="62%" stopColor="#ffcc00" />
            <stop offset="76%" stopColor="#ff9500" />
            <stop offset="90%" stopColor="#ff3b30" />
            <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
          </linearGradient>

          <filter
            id="prism-bloom-core"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="55" />
          </filter>
          <filter
            id="prism-bloom-edge"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Screen-blend keeps blacks pure; only the colored bits glow. */}
        <g style={{ mixBlendMode: "screen" }}>
          {/* Primary arc — anchored top-right, sweeps down off the right edge.
              Footprint stays in the right ~45% of the viewport. */}
          <path
            d="M 980,-260 Q 1760,260 2220,1100"
            stroke="url(#prism-core)"
            strokeWidth="360"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-core)"
            opacity="0.7"
          />
          <path
            d="M 980,-260 Q 1760,260 2220,1100"
            stroke="url(#prism-edge)"
            strokeWidth="46"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-edge)"
            opacity="0.85"
          />

          {/* Echo arc — small, bottom-left, lower-intensity reflection. */}
          <path
            d="M -180,1020 Q 240,840 760,1060"
            stroke="url(#prism-core)"
            strokeWidth="170"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-core)"
            opacity="0.45"
          />
          <path
            d="M -180,1020 Q 240,840 760,1060"
            stroke="url(#prism-edge)"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
            filter="url(#prism-bloom-edge)"
            opacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
}
