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
          {/* Warm body — along the path: red → orange → pure white → orange → red.
              This is the hot blade of light. Pure #ffffff in the middle, no cream. */}
          <linearGradient id="prism-warm" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ff1a00" stopOpacity="0" />
            <stop offset="8%" stopColor="#ff1a00" />
            <stop offset="22%" stopColor="#ff7a14" />
            <stop offset="38%" stopColor="#ffd23a" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="62%" stopColor="#ffd23a" />
            <stop offset="78%" stopColor="#ff7a14" />
            <stop offset="92%" stopColor="#ff1a00" />
            <stop offset="100%" stopColor="#ff1a00" stopOpacity="0" />
          </linearGradient>

          {/* Chromatic razor — full saturated spectrum running along the offset path.
              Real prism dispersion order: long wavelengths bend least (warm at the
              ends, cool at the center where bending is sharpest). */}
          <linearGradient id="prism-rainbow" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ff1a00" stopOpacity="0" />
            <stop offset="5%" stopColor="#ff1a00" />
            <stop offset="13%" stopColor="#ff7a14" />
            <stop offset="22%" stopColor="#ffd23a" />
            <stop offset="32%" stopColor="#7dff2a" />
            <stop offset="42%" stopColor="#00ff9c" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="58%" stopColor="#0066ff" />
            <stop offset="66%" stopColor="#3a14ff" />
            <stop offset="76%" stopColor="#c800ff" />
            <stop offset="86%" stopColor="#ff0066" />
            <stop offset="95%" stopColor="#ff1a00" />
            <stop offset="100%" stopColor="#ff1a00" stopOpacity="0" />
          </linearGradient>

          {/* Heavy bloom on the warm body for the soft halo. */}
          <filter
            id="warm-bloom"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="38" />
          </filter>

          {/* Razor-thin blur for the rainbow — keeps the spectrum bands distinct. */}
          <filter
            id="rainbow-razor"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Screen blend keeps blacks pure; the streak adds light over void. */}
        <g style={{ mixBlendMode: "screen" }}>
          {/* Warm body — bows to the upper right, sweeps from top edge to bottom edge.
              Stays in the right ~35% of the viewport. */}
          <path
            d="M 1180,-80 Q 1980,420 1880,1180"
            stroke="url(#prism-warm)"
            strokeWidth="340"
            strokeLinecap="round"
            fill="none"
            filter="url(#warm-bloom)"
            opacity="0.95"
          />

          {/* Rainbow razor — same shape, offset ~70px to the inside (concave side,
              i.e. lower-left of the curve). Tighter stroke, minimal blur. */}
          <path
            d="M 1110,-50 Q 1900,440 1810,1180"
            stroke="url(#prism-rainbow)"
            strokeWidth="44"
            strokeLinecap="round"
            fill="none"
            filter="url(#rainbow-razor)"
            opacity="1"
          />
        </g>
      </svg>
    </div>
  );
}
