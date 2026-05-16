import { ImageResponse } from "next/og";

export const alt = "bonsai — Cultivate AI you can trust";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const bg = "#000000";
  const foreground = "#ededf0";
  const muted = "#9aa1ac";
  const primary = "#7dd3a3";
  const border = "rgba(255, 255, 255, 0.08)";
  const gridLine = "rgba(125, 211, 163, 0.07)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: bg,
          color: foreground,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to right, ${gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            display: "flex",
          }}
        />
        {/* Prism streak — 8 stacked radial gradients along a diagonal on the
            right side, mirroring the AmbientPrism on the live site. Cool
            wavelengths up top, white-hot core in the middle, warm tail below. */}
        {[
          { rgb: "122, 20, 255", x: 970, y: 30, size: 260, opacity: 0.55 },
          { rgb: "32, 80, 255", x: 1000, y: 100, size: 260, opacity: 0.65 },
          { rgb: "0, 184, 255", x: 1035, y: 175, size: 280, opacity: 0.78 },
          { rgb: "0, 255, 168", x: 1075, y: 245, size: 280, opacity: 0.72 },
          { rgb: "255, 255, 255", x: 1115, y: 310, size: 340, opacity: 0.9 },
          { rgb: "255, 210, 58", x: 1145, y: 380, size: 280, opacity: 0.85 },
          { rgb: "255, 142, 26", x: 1175, y: 455, size: 300, opacity: 0.75 },
          { rgb: "255, 34, 0", x: 1205, y: 540, size: 340, opacity: 0.55 },
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

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: "56px 72px 0 72px",
            gap: 18,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="24" cy="6.5" rx="3.5" ry="3" fill="#7dd3a3" />
            <ellipse cx="11" cy="13" rx="6" ry="5" fill="#7dd3a3" opacity="0.92" />
            <ellipse cx="22" cy="11" rx="9" ry="6" fill="#7dd3a3" />
            <ellipse cx="32" cy="14" rx="5" ry="4" fill="#7dd3a3" opacity="0.9" />
            <ellipse cx="18" cy="16" rx="6.5" ry="3.5" fill="#7dd3a3" opacity="0.95" />
            <path
              d="M21 17.5 C 18.5 21.5, 23 24.5, 20 28.5"
              stroke="#6b4f3b"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="10" y="28" width="20" height="2.5" rx="1.1" fill="#6b4f3b" />
            <path d="M12 30.5 L28 30.5 L26 36 L14 36 Z" fill="#6b4f3b" opacity="0.85" />
          </svg>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: -0.5,
              color: primary,
            }}
          >
            bonsai
          </div>
        </div>

        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 600,
              letterSpacing: -2.5,
              lineHeight: 1.02,
              color: foreground,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Cultivate AI</div>
            <div
              style={{
                display: "flex",
                backgroundImage:
                  "linear-gradient(90deg, #a855f7 0%, #3b82f6 18%, #06b6d4 34%, #10b981 50%, #facc15 68%, #f97316 84%, #ef4444 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              you can trust.
            </div>
          </div>

          <div
            style={{
              fontSize: 26,
              color: muted,
              lineHeight: 1.4,
              maxWidth: 960,
              display: "flex",
            }}
          >
            AI systems don&apos;t pass or fail — they perform within distributions.
            Measure them, calibrate the judges, and prune releases on signal you
            can defend.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 72px 56px 72px",
            fontSize: 22,
            color: muted,
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span style={{ display: "flex" }}>Curriculum</span>
            <span style={{ display: "flex", color: border }}>·</span>
            <span style={{ display: "flex" }}>Labs</span>
            <span style={{ display: "flex", color: border }}>·</span>
            <span style={{ display: "flex" }}>System Designs</span>
            <span style={{ display: "flex", color: border }}>·</span>
            <span style={{ display: "flex" }}>Quizzes</span>
          </div>
          <div style={{ display: "flex", color: primary, fontWeight: 600, fontStyle: "italic" }}>
            Read, run, design, defend.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
