import { ImageResponse } from "next/og";

import { siteConfig } from "@/constants";

export const runtime = "edge";
export const alt = "Nimbus — Cloud storage that gets out of your way";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0a0e1a",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(99,102,241,0.55) 0%, transparent 55%), radial-gradient(circle at 82% 78%, rgba(168,85,247,0.45) 0%, transparent 55%), radial-gradient(circle at 60% 35%, rgba(56,189,248,0.35) 0%, transparent 60%)",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%)",
              boxShadow: "0 10px 30px rgba(99,102,241,0.45)",
              fontSize: 30,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            N
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
            {siteConfig.shortTitle}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              backgroundImage:
                "linear-gradient(90deg, #ffffff 0%, #c7d2fe 50%, #a5f3fc 100%)",
              backgroundClip: "text",
              color: "transparent",
              maxWidth: 980,
            }}
          >
            Cloud storage that gets out of your way.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(226,232,240,0.85)",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Upload, organize, share, and access anywhere — built on Appwrite,
            Next.js, and shadcn/ui.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(148,163,184,0.85)",
          }}
        >
          <div>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #6366f1, #a855f7, #38bdf8)",
              }}
            />
            <div>by {siteConfig.author}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
