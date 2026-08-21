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
          background: "#0c0b09",
        }}
      >
        <div
          style={{
            width: 148,
            height: 148,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
            padding: 22,
            border: "10px solid #e4b84a",
          }}
        >
          <div style={{ height: 12, width: "100%", background: "#e4b84a" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 12, width: 72, background: "#e4b84a" }} />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#ff5a1f",
              }}
            />
          </div>
          <div style={{ height: 12, width: "78%", background: "#e4b84a" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
