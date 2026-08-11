import type { ComponentType } from "react";
import ComplianceReportDemo from "./ComplianceReportDemo";
import LiquidDistortionDemo from "./LiquidDistortionDemo";
import SlidingBarDemo from "./SlidingBarDemo";

export type DemoEntry = {
  /** Label shown on the demo frame. */
  label: string;
  /** Interactive component rendered in the article. */
  Component: ComponentType;
  /** "How it works" reveal: a short note plus the essential code. */
  how: { note: string; lang: string; code: string };
};

export const demoRegistry: Record<string, DemoEntry> = {
  "compliance-report-views": {
    label: "Live: one dataset, three report views",
    Component: ComplianceReportDemo,
    how: {
      note: "The production reports shared a document shell and compliance domain data, then selected a composition from TemplateType. This synthetic example keeps the overall result fixed while changing how the same findings are grouped for a framework reviewer, cloud owner, or accountable team.",
      lang: "tsx",
      code: `const projection = {
  [REPORT_TYPES.DEFAULT]: FrameworkReport,
  [REPORT_TYPES.CLOUD_WISE]: CloudReport,
  [REPORT_TYPES.OWNER_WISE]: OwnerReport,
} satisfies Record<TemplateType, ReportComponent>;

function ComplianceReport({ report }: Props) {
  const ReportSections = projection[report.data.TemplateType];

  return (
    <ReportDocument>
      <ReportTitle data={report.data} />
      <TableOfContents data={report.data} />
      <ReportSections report={report} />
    </ReportDocument>
  );
}`,
    },
  },
  "liquid-distortion": {
    label: "Live: cursor momentum shader",
    Component: () => <LiquidDistortionDemo className="max-w-full" />,
    how: {
      note: "The cursor writes velocity into a low-resolution field, then the display shader bends a procedural texture through that field. The trick is using movement delta as force: position alone only creates a spotlight, not liquid drag.",
      lang: "glsl",
      code: `// sim pass: velocity field in a ping-pong render target
vec2 v = texture2D(uPrev, vUv - prevV * uAdvect).xy;
v = mix(v, neighborAverage, 0.14);
v *= uDissipation;

vec2 d = vUv - uMouse;
d.x *= uAspect;
float fall = exp(-dot(d, d) / uRadius);
v += uVel * fall;

// display pass: refract content through the field
vec2 field = texture2D(uField, vUv).xy;
vec2 uv = vUv + field * uStrength;
vec3 col = vec3(
  texture2D(uTex, uv + field * uStrength * 0.6).r,
  texture2D(uTex, uv).g,
  texture2D(uTex, uv - field * uStrength * 0.6).b
);`,
    },
  },
  "sliding-bar": {
    label: "Live: click an item",
    Component: () => (
      <SlidingBarDemo className="max-w-full w-fit min-w-3xs mx-auto" />
    ),
    how: {
      note: "The bar lives inside the active list item and is named only during a slide. The browser pairs it across the old and new page and tweens its position, with no JS positioning. (The demo above uses a plain CSS transition since it never remounts; the real nav rides the View Transition.)",
      lang: "tsx",
      code: `// markup: bar is a child of the active <li>
<li>
  {isActive && <span data-toc-bar aria-hidden />}
  <Link …>{label}</Link>
</li>

/* css: named only during the page slide, so the
   browser interpolates its position with the slide */
html[data-slide-active] [data-toc-bar] {
  view-transition-name: toc-active-bar;
}`,
    },
  },
};
