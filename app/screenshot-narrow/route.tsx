import { ImageResponse } from "next/og";

import { siteConfig } from "@/constants";

export const runtime = "edge";

const size = { width: 720, height: 1280 };

const FILES = [
  { name: "Q4-financials.pdf", meta: "PDF · 2.4 MB", tint: "#ef4444" },
  { name: "Brand-cover.png", meta: "Image · 1.1 MB", tint: "#22c55e" },
  { name: "Launch-clip.mp4", meta: "Video · 18 MB", tint: "#3b82f6" },
  { name: "Roadmap.docx", meta: "Doc · 184 KB", tint: "#f59e0b" },
];

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 36,
          gap: 24,
          backgroundColor: "#0a0e1a",
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(99,102,241,0.5) 0%, transparent 55%), radial-gradient(circle at 80% 88%, rgba(168,85,247,0.45) 0%, transparent 60%)",
          color: "#e2e8f0",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%)",
                fontSize: 28,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              N
            </div>
            <div
              style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}
            >
              {siteConfig.shortTitle}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
            }}
          />
        </div>

        <div
          style={{
            padding: "18px 22px",
            borderRadius: 16,
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(99,102,241,0.25)",
            fontSize: 18,
            color: "rgba(148,163,184,0.95)",
          }}
        >
          Search files and folders...
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -0.5,
              lineHeight: 1.1,
            }}
          >
            Your files,
            <br />
            anywhere.
          </div>
          <div style={{ fontSize: 18, color: "rgba(148,163,184,0.95)" }}>
            Offline-ready PWA, AI search, and Beam transfer.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FILES.map((f) => (
            <div
              key={f.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 18,
                borderRadius: 18,
                background: "rgba(15,23,42,0.78)",
                border: "1px solid rgba(99,102,241,0.22)",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${f.tint} 0%, rgba(99,102,241,0.6) 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                {f.name.split(".").pop()?.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  {f.name}
                </div>
                <div
                  style={{ fontSize: 16, color: "rgba(148,163,184,0.9)" }}
                >
                  {f.meta}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            alignSelf: "center",
            padding: "12px 24px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))",
            border: "1px solid rgba(99,102,241,0.4)",
            fontSize: 18,
            color: "#c7d2fe",
          }}
        >
          Install Nimbus on your home screen
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    },
  );
}
