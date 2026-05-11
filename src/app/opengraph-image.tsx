import { ImageResponse } from "next/og";

export const alt = "bonsai — Cultivate AI you can trust";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const bg = "#08090b";
  const foreground = "#ededf0";
  const muted = "#9aa1ac";
  const primary = "#d4a373";
  const border = "rgba(255, 255, 255, 0.08)";
  const gridLine = "rgba(212, 163, 115, 0.07)";

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
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: 720,
            background:
              "radial-gradient(circle at center, rgba(244, 162, 97, 0.32), rgba(244, 162, 97, 0) 65%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -280,
            left: -160,
            width: 680,
            height: 680,
            borderRadius: 680,
            background:
              "radial-gradient(circle at center, rgba(176, 137, 104, 0.28), rgba(176, 137, 104, 0) 65%)",
            display: "flex",
          }}
        />

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
            <ellipse cx="24" cy="6.5" rx="3.5" ry="3" fill="#d4a373" />
            <ellipse cx="11" cy="13" rx="6" ry="5" fill="#d4a373" opacity="0.92" />
            <ellipse cx="22" cy="11" rx="9" ry="6" fill="#d4a373" />
            <ellipse cx="32" cy="14" rx="5" ry="4" fill="#d4a373" opacity="0.9" />
            <ellipse cx="18" cy="16" rx="6.5" ry="3.5" fill="#d4a373" opacity="0.95" />
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
                  "linear-gradient(135deg, #d4a373 0%, #b08968 50%, #f4a261 100%)",
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
