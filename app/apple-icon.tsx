import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          position: "relative",
          borderRadius: 40,
          background:
            "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #0ea5e9 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 40,
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 55%)",
          }}
        />
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
        >
          <path d="M17 17H7a4 4 0 1 1 1.2-7.8A5.5 5.5 0 0 1 18.8 9 4 4 0 0 1 17 17Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
