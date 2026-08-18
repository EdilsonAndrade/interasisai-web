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
          background: "#0B1020",
          borderRadius: 7,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path
            d="M9.5 22.5 14 10M18 10l4.5 12.5M10 24h12"
            stroke="#F8FAFC"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="24" r="3.4" fill="#1D6FE8" />
          <circle cx="16" cy="8" r="3.4" fill="#F8FAFC" />
          <circle cx="25" cy="24" r="3.4" fill="#1D6FE8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
