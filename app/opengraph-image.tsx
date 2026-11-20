import { ImageResponse } from "next/og";

export const alt = "Page Inspector — find what's holding your website back";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFE9E7",
          padding: 72,
          fontFamily: "sans-serif",
          color: "#1E1F21",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#F06A6A", marginRight: 6 }} />
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#796EFF", marginRight: 6 }} />
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#1E1F21", marginRight: 18 }} />
          Page Inspector
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Find what&rsquo;s holding your website back.
          </div>
          <div style={{ fontSize: 32, color: "#6D6E6F", marginTop: 24 }}>
            AI website audit · free preview · full PDF report for €8
          </div>
        </div>
      </div>
    ),
    size
  );
}
