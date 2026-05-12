import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          background: "#4A90D9",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M16 14V24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M12 14L16 10L20 14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      width: 32,
      height: 32,
    },
  );
}