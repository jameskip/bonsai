import { ImageResponse } from "next/og";

export const alt = "Bonsai · Cultivate AI you can trust";
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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: primary,
              color: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: -0.5,
              color: foreground,
            }}
          >
            Bonsai
          </div>
          <div
            style={{
              fontSize: 18,
              color: muted,
              border: `1px solid ${border}`,
              borderRadius: 999,
              padding: "6px 14px",
              marginLeft: 6,
            }}
          >
            Cultivate AI you can trust
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
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.02,
              color: foreground,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Quality assurance,</div>
            <div style={{ display: "flex" }}>for systems that</div>
            <div
              style={{
                display: "flex",
                backgroundImage:
                  "linear-gradient(135deg, #d4a373 0%, #b08968 50%, #f4a261 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              don&apos;t repeat themselves.
            </div>
          </div>

          <div
            style={{
              fontSize: 26,
              color: muted,
              lineHeight: 1.4,
              maxWidth: 920,
              display: "flex",
            }}
          >
            Evals, LLM-as-judge, RAG and agent harnesses, red-teaming, drift,
            and CI/CD that respects statistical noise.
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
          <div style={{ display: "flex", color: primary, fontWeight: 600 }}>
            bonsai
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
