import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background:
            "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #0ea5e9 100%)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 17H7a4 4 0 1 1 1.2-7.8A5.5 5.5 0 0 1 18.8 9 4 4 0 0 1 17 17Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
