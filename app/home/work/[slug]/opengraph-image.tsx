import { ImageResponse } from "next/og";
import { OG, OG_SIZE, ogFonts } from "@/lib/og";
import { profile } from "@/lib/profile.config";
import { getCaseStudySlugs, getProjectBySlug } from "@/lib/projects.config";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `Case study by ${profile.name} (${profile.handle})`;

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

// Per case study: editorial paper card — a slice of the case-study header.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  const title = project?.title ?? "Case Study";
  const num = String(project?.number ?? 0).padStart(2, "0");
  const tags = (project?.caseStudy?.tags ?? []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background: OG.paper,
          color: OG.ink,
          fontFamily: "Poppins",
          padding: 76,
        }}
      >
        {/* accent top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: OG.accent,
          }}
        />

        {/* top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "JetBrains Mono",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", fontWeight: 600, letterSpacing: 4 }}>
            {profile.handle.toUpperCase()} · {profile.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", color: OG.inkFaint, letterSpacing: 4 }}>
            NO. {num}
          </div>
        </div>

        {/* title */}
        <div
          style={{
            display: "flex",
            fontFamily: "Roboto Condensed",
            fontWeight: 600,
            fontSize: 84,
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* tags + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {tags.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  border: `1px solid ${OG.border}`,
                  borderRadius: 99,
                  padding: "8px 18px",
                  fontSize: 22,
                  color: OG.inkDim,
                }}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 26 }}>eega.dev</div>
        </div>
      </div>
    ),
    { width: OG_SIZE.width, height: OG_SIZE.height, fonts: ogFonts() },
  );
}
