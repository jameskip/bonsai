import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const FOLIAGE = "#7dd3a3";
const WOOD = "#6b4f3b";
const BG = "#000000";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          position: "relative",
        }}
      >
        {/* Small prism halo in the upper-right corner — hints at the streak
            without dominating the bonsai mark. */}
        {[
          { rgb: "0, 184, 255", x: 145, y: 18, size: 100, opacity: 0.5 },
          { rgb: "255, 255, 255", x: 160, y: 38, size: 120, opacity: 0.7 },
          { rgb: "255, 142, 26", x: 175, y: 64, size: 110, opacity: 0.55 },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: o.x - o.size / 2,
              top: o.y - o.size / 2,
              width: o.size,
              height: o.size,
              borderRadius: o.size,
              background: `radial-gradient(circle at center, rgba(${o.rgb}, ${o.opacity}), rgba(${o.rgb}, 0) 70%)`,
              display: "flex",
            }}
          />
        ))}
        <svg
          width="132"
          height="132"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="24" cy="6.5" rx="3.5" ry="3" fill={FOLIAGE} />
          <ellipse cx="11" cy="13" rx="6" ry="5" fill={FOLIAGE} opacity="0.92" />
          <ellipse cx="22" cy="11" rx="9" ry="6" fill={FOLIAGE} />
          <ellipse cx="32" cy="14" rx="5" ry="4" fill={FOLIAGE} opacity="0.9" />
          <ellipse cx="18" cy="16" rx="6.5" ry="3.5" fill={FOLIAGE} opacity="0.95" />
          <path
            d="M21 17.5 C 18.5 21.5, 23 24.5, 20 28.5"
            stroke={WOOD}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="10" y="28" width="20" height="2.5" rx="1.1" fill={WOOD} />
          <path d="M12 30.5 L28 30.5 L26 36 L14 36 Z" fill={WOOD} opacity="0.85" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
