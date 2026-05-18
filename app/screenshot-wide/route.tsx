import { ImageResponse } from "next/og";

import { siteConfig } from "@/constants";

export const runtime = "edge";

const size = { width: 1280, height: 720 };

const FILES = [
  { name: "Q4-financials.pdf", meta: "PDF · 2.4 MB", tint: "#ef4444" },
  { name: "Brand-cover.png", meta: "Image · 1.1 MB", tint: "#22c55e" },
  { name: "Launch-clip.mp4", meta: "Video · 18 MB", tint: "#3b82f6" },
  { name: "Roadmap.docx", meta: "Doc · 184 KB", tint: "#f59e0b" },
  { name: "Mockups.zip", meta: "Archive · 9.2 MB", tint: "#a855f7" },
  { name: "Notes.md", meta: "Markdown · 12 KB", tint: "#06b6d4" },
];

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0e1a",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(99,102,241,0.45) 0%, transparent 55%), radial-gradient(circle at 88% 82%, rgba(168,85,247,0.4) 0%, transparent 55%)",
          color: "#e2e8f0",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 40,
        }}
      >
        <div
          style={{
            width: 240,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: 24,
            borderRadius: 20,
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%)",
                fontSize: 20,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              N
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ffffff" }}>
              {siteConfig.shortTitle}
            </div>
          </div>
          {[
            "Dashboard",
            "Documents",
            "Images",
            "Media",
            "Ask AI",
            "Trash",
          ].map((label, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 16,
                padding: "8px 10px",
                borderRadius: 10,
                color: i === 0 ? "#ffffff" : "rgba(148,163,184,0.95)",
                background:
                  i === 0 ? "rgba(99,102,241,0.18)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background:
                    i === 0
                      ? "linear-gradient(135deg,#6366f1,#a855f7)"
                      : "rgba(148,163,184,0.5)",
                }}
              />
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: 28,
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderRadius: 16,
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div style={{ fontSize: 16, color: "rgba(148,163,184,0.9)" }}>
              Search files, folders, actions...
            </div>
            <div
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(99,102,241,0.2)",
                color: "#c7d2fe",
              }}
            >
              Ctrl K
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: -0.5,
              }}
            >
              Your workspace
            </div>
            <div style={{ fontSize: 16, color: "rgba(148,163,184,0.9)" }}>
              Folders, fast search, share links, and offline-ready PWA.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {FILES.map((f) => (
              <div
                key={f.name}
                style={{
                  width: 240,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <div
                  style={{
                    height: 88,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${f.tint} 0%, rgba(99,102,241,0.6) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#ffffff",
                  }}
                >
                  {f.name.split(".").pop()?.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  {f.name}
                </div>
                <div
                  style={{ fontSize: 12, color: "rgba(148,163,184,0.9)" }}
                >
                  {f.meta}
                </div>
              </div>
            ))}
          </div>
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
