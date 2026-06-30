import { ImageResponse } from "next/og";
import { OG, OG_SIZE, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Somu — Frontend Developer";

// Home / default card: a terminal splash.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG.dark,
          color: OG.darkInk,
          fontFamily: "Source Code Pro",
          padding: 72,
        }}
      >
        {/* window chrome */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 9 }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, background: "#ff5f57" }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, background: "#febc2e" }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, background: "#28c840" }} />
          </div>
          <div style={{ display: "flex", marginLeft: 20, fontSize: 22, color: OG.darkDim }}>
            somu — zsh
          </div>
        </div>

        {/* body */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 28, color: OG.darkDim }}>
            <span style={{ color: OG.accent }}>{">"}</span>
            <span style={{ marginLeft: 14 }}>whoami</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Glass Antiqua",
              fontSize: 132,
              lineHeight: 1,
              marginTop: 14,
            }}
          >
            Somu
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 18 }}>
            Frontend developer
          </div>
          <div style={{ display: "flex", fontSize: 26, color: OG.darkDim, marginTop: 14 }}>
            interfaces that survive real data.
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: OG.darkDim,
          }}
        >
          <div style={{ display: "flex" }}>Next.js · View Transitions · GSAP</div>
          <div style={{ display: "flex", color: OG.darkInk }}>eega.dev</div>
        </div>
      </div>
    ),
    { width: OG_SIZE.width, height: OG_SIZE.height, fonts: ogFonts() },
  );
}
