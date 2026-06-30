import { ImageResponse } from "next/og";
import { OG, ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — serif S monogram in the brand serif on the accent.
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
          background: OG.accent,
          color: "#f3f1eb",
          fontFamily: "Glass Antiqua",
          fontSize: 130,
          lineHeight: 1,
          paddingBottom: 8,
        }}
      >
        S
      </div>
    ),
    { width: size.width, height: size.height, fonts: ogFonts() },
  );
}
