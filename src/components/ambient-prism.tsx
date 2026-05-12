// Parallel stroked bands offset perpendicular to a shared bezier path.
// Cool wavelengths bend MORE (further from the original direction), so the
// rainbow side spreads wider than the warm side — matching real prism dispersion.
const BASE_PATH = "M 1180,-100 Q 1980,440 1880,1180";

type Band = {
  color: string;
  /** Perpendicular offset in viewBox units. Negative = cool/inside, positive = warm/outside. */
  offset: number;
  width: number;
  opacity: number;
};

const BANDS: Band[] = [
  // Cool side — full rainbow spread (refracts more, fans wider).
  { color: "#7a14ff", offset: -160, width: 18, opacity: 0.55 },
  { color: "#5a14ff", offset: -135, width: 20, opacity: 0.75 },
  { color: "#2050ff", offset: -112, width: 22, opacity: 0.9 },
  { color: "#0080ff", offset: -90, width: 24, opacity: 0.95 },
  { color: "#00c8ff", offset: -68, width: 26, opacity: 1 },
  { color: "#00ffa8", offset: -46, width: 26, opacity: 0.95 },
  { color: "#7dff2a", offset: -24, width: 24, opacity: 0.85 },

  // White hot core — narrow so it doesn't swamp the spectrum on either side.
  { color: "#ffffff", offset: 0, width: 56, opacity: 0.95 },

  // Warm side — refracts less, narrower spread, fades into red.
  { color: "#ffd23a", offset: 26, width: 26, opacity: 0.95 },
  { color: "#ff8e1a", offset: 50, width: 32, opacity: 0.92 },
  { color: "#ff2200", offset: 80, width: 38, opacity: 0.8 },
  { color: "#ff1100", offset: 120, width: 28, opacity: 0.45 },
];

function offsetPath(offset: number): string {
  return `M ${1180 + offset},-100 Q ${1980 + offset},440 ${1880 + offset},1180`;
}

export function AmbientPrism() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-screen -z-10 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Single soft blur over the whole group so adjacent bands bleed
              smoothly into each other without losing saturation. */}
          <filter
            id="prism-blend"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>

        <g style={{ mixBlendMode: "screen" }} filter="url(#prism-blend)">
          {BANDS.map((b, i) => (
            <path
              key={i}
              d={offsetPath(b.offset)}
              stroke={b.color}
              strokeWidth={b.width}
              strokeLinecap="round"
              fill="none"
              opacity={b.opacity}
            />
          ))}
        </g>

        {/* Outer halo — adds the warm bloom around the white core without
            washing out the rainbow bands. */}
        <g style={{ mixBlendMode: "screen" }}>
          <path
            d={BASE_PATH}
            stroke="#ff6a1a"
            strokeWidth="280"
            strokeLinecap="round"
            fill="none"
            opacity="0.18"
            filter="url(#prism-blend)"
            transform="translate(40, 0)"
          />
        </g>
      </svg>
    </div>
  );
}
