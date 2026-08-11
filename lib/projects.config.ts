export type Category = "pro" | "creative" | "more";
export type Status =
  | "SHIPPED"
  | "INTERNSHIP"
  | "IN PROGRESS"
  | "OPEN SOURCE"
  | "COMING SOON";
export type Accent = "blue" | "teal" | "orange" | "green" | "neutral";

import type { Thumbnail } from "./thumbnail";

export type Block =
  | { type: "paragraph"; text: string; emphasis?: string[] }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      height?: number;
    }
  | { type: "callout"; accent: Accent; text: string }
  | {
      type: "list";
      ordered?: boolean;
      items: { num?: string; title?: string; text: string }[];
    }
  | { type: "metrics"; items: { value: string; label: string }[] }
  | {
      type: "diagram";
      kind:
        | "token-mismatch"
        | "compliance-pipeline"
        | "dual-render"
        | "memory-blowup"
        | "vt-approaches"
        | "photography-pipeline"
        | "photo-delivery";
    }
  | { type: "demo"; id: string; caption?: string }
  | { type: "vtlab" };

export interface CaseStudySection {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface CaseStudy {
  tagline: string;
  tags: string[];
  hero: { image?: string; accent: Accent };
  sections: CaseStudySection[];
}

export interface Project {
  slug: string;
  number: number;
  title: string;
  description?: string;
  category: Category;
  role: string;
  team: string;
  shipped: string;
  status: Status | Status[];
  tech: string[];
  tilt?: number;
  thumbnail?: Thumbnail;
  external?: boolean;
  href?: string;
  note?: string;
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  // ── Primary work ──────────────────────────────────────────────────────────
  {
    slug: "design-system",
    number: 1,
    title: "AI-Optimized Design System",
    description:
      "Token-driven component library that cut UI delivery from weeks to days.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Platform + Design",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["React", "TypeScript", "Storybook", "Figma Tokens"],
    tilt: -1.2,
    thumbnail: {
      kind: "flip",
      accent: "blue",
      alt: "Design system — tokens, type scale, and components, flipping to the project spec",
      params: {
        front: {
          label: "DESIGN SYSTEM",
          sublabel: "tokens · components",
          swatches: [
            "#3B82F6",
            "#E08A5F",
            "#34D399",
            "#E5E5E5",
            "#9A9A9D",
            "#3A3A3F",
          ],
          type: {
            display: "Aa",
            sample: "The quick brown fox",
            scaleLabel: "DISPLAY · BODY · LABEL",
          },
          button: { label: "Ship →" },
          badge: "SHIPPED",
          showToggle: true,
          input: "search components…",
          showRadii: true,
        },
        back: {
          heading: "SPEC",
          rows: [
            { k: "STACK", v: "Next · Tailwind · TS · Figma" },
            { k: "IMPACT", v: "−50% dup logic", accent: true },
            { k: "DELIVERY", v: "2–3 wk → <1 wk" },
            { k: "ROLE", v: "Frontend Engineer" },
            { k: "YEAR", v: "2024" },
          ],
        },
      },
    },
    note: "Flip thumbnail — dark token artboard front, spec sheet back on hover.",
    caseStudy: {
      tagline:
        "We didn't set out to build a design system. We were trying to stop an AI from generating the wrong shade of blue.",
      tags: ["AI Agents", "Figma Tokens", "Tailwind", "Storybook"],
      hero: { accent: "teal" },
      sections: [
        {
          id: "the-wrong-blue",
          heading: "Confidently Wrong",
          blocks: [
            {
              type: "paragraph",
              text: "It started with a button. We ran a Figma design through our MCP setup, asked the agent to implement it, and got back clean, confident code. The button was blue. Just not the right blue.",
            },
            {
              type: "paragraph",
              text: "Our brand blue lives at av-blue-500 — a custom token in our Tailwind config. In Figma, it was simply labeled blue. When the LLM saw that coming through the MCP context, it mapped it to Tailwind's stock blue-500. Same name, different hex. The output looked plausible enough to slip past a quick review.",
              emphasis: ["av-blue-500", "blue", "blue-500"],
            },
            {
              type: "diagram",
              kind: "token-mismatch",
            },
            {
              type: "paragraph",
              text: "And it wasn't just blue. Any Figma variable name that overlapped with Tailwind's built-in vocabulary was a potential mismatch. We'd catch it in review, ask for corrections, re-run. The frustrating part wasn't that the AI got it wrong — it had no way to know it was wrong.",
            },
          ],
        },
        {
          id: "the-bandaid",
          heading: "The Fix That Wasn't",
          blocks: [
            {
              type: "paragraph",
              text: "The fastest thing we could do was write a .md file. Token naming convention, Figma-to-Tailwind translation, a line telling the agent 'when Figma says blue, use av-blue-500.' Dropped it into agent context for every UI task. It worked.",
            },
            {
              type: "callout",
              accent: "orange",
              text: "Until someone forgot to include it. Until context filled up and it got truncated. Until a new session started with a clean slate. A doc that has to be manually loaded every time is not a system — it's a reminder that the system is broken.",
            },
          ],
        },
        {
          id: "fixing-the-source",
          heading: "Both Sides Were Ready",
          blocks: [
            {
              type: "paragraph",
              text: "The real problem was structural. Figma had variables — just blue, green, brand-primary — declared with no architecture. No primitive layer, no semantic mappings, no consistent naming convention to anchor anything to.",
            },
            {
              type: "paragraph",
              text: "When we brought this to the design and product team, they weren't surprised. They'd wanted to fix Figma's token structure for a while too — the old setup had variables but no reusable component mappings, and designers were working around it constantly. The AI problem gave everyone a concrete reason to finally do it.",
              emphasis: [
                "The AI problem gave everyone a concrete reason to finally do it.",
              ],
            },
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Primitives",
                  text: "Raw values — every color in the palette named by scale. av-blue-50 through av-blue-950, matching the frontend token names exactly.",
                },
                {
                  num: "02",
                  title: "Semantic layer",
                  text: "Intent-based tokens — action-primary, surface-default, text-muted. What designers reference in components.",
                },
                {
                  num: "03",
                  title: "Maps",
                  text: "Explicit bindings from Figma semantic tokens to frontend Tailwind tokens. What the LLM actually resolves when it reads a design.",
                },
              ],
            },
          ],
        },
        {
          id: "the-tradeoff",
          heading: "The Call We Almost Got Wrong",
          blocks: [
            {
              type: "paragraph",
              text: "Once tokens were cleaner on both sides, there was an obvious next question: should the frontend match it completely? Build a full custom design system — primitives, semantic layer, component styles — using CSS custom properties and typed objects instead of Tailwind utilities?",
            },
            {
              type: "paragraph",
              text: "We looked at it seriously. It's the clean-room ideal. But Tailwind already provides a semantic utility layer, we'd been on it since day one, and migrating the entire app would cost weeks for gains that were mostly theoretical. The av- prefix was already working. We kept it.",
              emphasis: ["av-"],
            },
            {
              type: "callout",
              accent: "neutral",
              text: "The right tradeoff isn't always the architecturally pure one. Sometimes it's the one that closes the actual gap without blowing up what's already working.",
            },
          ],
        },
        {
          id: "teaching-the-llm",
          heading: "Teaching the Machine",
          blocks: [
            {
              type: "paragraph",
              text: "With tokens aligned, we wrote the real version of that earlier .md file — docs/design-system.md. Token translation tables, component APIs, exact prop shapes, common pitfalls. Everything an LLM needs to generate correct UI without guessing.",
              emphasis: ["docs/design-system.md"],
            },
            {
              type: "paragraph",
              text: "One detail that matters: this doc isn't loaded into every agent context. AGENTS.md references it conditionally — the agent pulls it in only when the task involves UI. For everything else, the doc stays out of context entirely. Rough estimate, we're spending 30-40% less tokens on corrections and re-runs compared to before.",
            },
          ],
        },
        {
          id: "component-rollout",
          heading: "Component by Component",
          blocks: [
            {
              type: "paragraph",
              text: "Fixing tokens solved the color problem. But there's a second failure mode: an LLM reaching for a custom one-off implementation when a shared component already exists. We started documenting the component library, most-used first.",
            },
            {
              type: "list",
              ordered: false,
              items: [
                {
                  title: "AVButton",
                  text: "Props, variants, loading states, accessibility requirements.",
                },
                {
                  title: "Icons16 / Icons24",
                  text: "Import paths, stroke-vs-fill distinction, sizing conventions.",
                },
                {
                  title: "AVShimmer",
                  text: "When to use it, the parent-dimensions gotcha.",
                },
                {
                  title: "AVTooltip",
                  text: "Hover vs click mode, portal flag for overflow parents.",
                },
                {
                  title: "AVTablePaginated",
                  text: "Full table API including collapsible rows and progressive loading.",
                },
              ],
            },
            {
              type: "paragraph",
              text: "For the core ones — buttons, icons, shimmer, tooltip, metric cards — Storybook previews went up too. Locally hosted, so design can verify a component without running the full app.",
            },
            {
              type: "paragraph",
              text: "Still in progress. Every component that gets documented is one less thing the LLM has to invent.",
            },
          ],
        },
        {
          id: "impact",
          heading: "Where It Stands",
          blocks: [
            {
              type: "metrics",
              items: [
                { value: "<1 wk", label: "UI delivery (was 2–3 wk)" },
                { value: "~35%", label: "Less LLM context on corrections" },
                { value: "10+", label: "Components documented" },
              ],
            },
            {
              type: "paragraph",
              text: "There are still edge cases. An agent will occasionally reach for a raw Tailwind class when an av- token is the right call. But the floor is higher now, and the drift is much smaller.",
              emphasis: ["the floor is higher"],
            },
            {
              type: "paragraph",
              text: "The bigger shift is that design and engineering are finally working from the same source of truth. That wasn't the original goal — it was a side effect of trying to fix an AI hallucination problem.",
              emphasis: [
                "side effect of trying to fix an AI hallucination problem.",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "compliance-reporting",
    number: 2,
    title: "Compliance Reporting Platform",
    description:
      "A browser-native reporting system that matched the product—then exposed the cost of running Chromium in the wrong place.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Compliance Engineering",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["Next.js", "TypeScript", "Go", "chromedp", "SSR", "Print CSS"],
    tilt: 0.8,
    thumbnail: {
      kind: "ascii",
      alt: "ASCII render of the compliance reporting pipeline",
      accent: "blue",
    },
    caseStudy: {
      tagline:
        "The report looked like the product. Then real customer data showed that rendering architecture and execution architecture were two different decisions.",
      tags: ["Next.js", "chromedp", "SSR", "Print CSS"],
      hero: { accent: "blue" },
      sections: [
        {
          id: "the-product-requirement",
          heading: "The PDF Looked Like a Product",
          blocks: [
            {
              type: "paragraph",
              text: "The hard part was never writing bytes into a .pdf file. Aurva needed customer-facing compliance reports with branded title pages, status summaries, severity badges, long violation tables, framework breakdowns, appendices, a table of contents, timestamps, and page numbers. Customers also needed to preview the document before exporting it.",
            },
            {
              type: "paragraph",
              text: "This was greenfield work. The backend was primarily Go, so the first architectural decision was whether the document should become a backend-owned template system or a real frontend surface rendered through the browser.",
              emphasis: ["greenfield work"],
            },
            {
              type: "callout",
              accent: "blue",
              text: "The question was not “Which PDF library?” It was “Where should the report's presentation system live?”",
            },
          ],
        },
        {
          id: "the-architecture-decision",
          heading: "Let the Frontend Render It Once",
          blocks: [
            {
              type: "paragraph",
              text: "I proposed building the report in the existing Next.js frontend and using Chromium's print pipeline as the document renderer. Aurva already had typography, color tokens, tables, badges, icons, and spacing conventions there. Rebuilding those primitives in Go would have created a second presentation system that could drift every time the product design changed.",
              emphasis: ["building the report in the existing Next.js frontend"],
            },
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Reuse the visual language",
                  text: "Compose reports from the frontend design system instead of approximating the Figma work in a separate backend template stack.",
                },
                {
                  num: "02",
                  title: "Keep the preview real",
                  text: "Make the rendering URL a useful browser document with scrolling and anchor navigation, not an invisible intermediate artifact.",
                },
                {
                  num: "03",
                  title: "Print the same semantic tree",
                  text: "Use @media print and paged-media CSS to turn that HTML into an A4 document rather than maintaining a second PDF-only composition.",
                },
              ],
            },
            {
              type: "paragraph",
              text: "The result was template-driven, component-based report composition—not a universal schema renderer. That boundary kept the system concrete enough to match the approved layouts while still sharing the parts that were actually common.",
            },
          ],
        },
        {
          id: "the-rendering-route",
          heading: "SSR as Rendering Infrastructure",
          blocks: [
            {
              type: "paragraph",
              text: "The backend created a very short-lived token and opened a special route shaped like /reports/compliance?reportId=…&token=…. The route intentionally did not depend on a normal logged-in browser session. getServerSideProps read the parameters, fetched the serialized report payload with the token, parsed it, and rendered the document on the server.",
              emphasis: ["getServerSideProps"],
            },
            {
              type: "paragraph",
              text: "SSR mattered because the page's machine consumer was a headless browser. Chromium received substantially rendered HTML instead of booting a client shell, fetching data, waiting for React state, waiting for layout, and only then entering the print pipeline.",
              emphasis: ["machine consumer was a headless browser"],
            },
            {
              type: "paragraph",
              text: "At the time, Aurva did not yet have RBAC. The historical token was generic and short-lived, not narrowly scoped to one report permission. That was a pragmatic control for the original system, but it is not the authorization model I would design today.",
            },
            {
              type: "callout",
              accent: "orange",
              text: "Short-lived is not the same as least-privilege. The route reduced exposure time; it did not make the token report-scoped.",
            },
          ],
        },
        {
          id: "the-document-system",
          heading: "One Domain, Five Report Projections",
          blocks: [
            {
              type: "paragraph",
              text: "The shared outer document rendered the report title, header, table of contents, page rules, and common layouts. TemplateType then selected the major summary, compliance, and appendix sections for DEFAULT, OWNER_WISE, INDIVIDUAL_OWNER_WISE, CLOUD_WISE, or INDIVIDUAL_CLOUD_WISE reports.",
              emphasis: ["TemplateType"],
            },
            {
              type: "demo",
              id: "compliance-report-views",
              caption: "Synthetic data only. Switch the projection to see one compliance result reorganized for three different readers.",
            },
            {
              type: "list",
              items: [
                {
                  title: "Framework",
                  text: "Compliance overview, framework sections, and a unified violation appendix.",
                },
                {
                  title: "Cloud",
                  text: "Overall and cloud summaries, per-cloud compliance, and cloud-wise appendices.",
                },
                {
                  title: "Owner",
                  text: "Overall and user summaries, per-owner compliance, and owner-wise violation details.",
                },
              ],
            },
            {
              type: "paragraph",
              text: "The table of contents was built independently from the rendered document, although both consumed the same TemplateType and ordered data. TOC numbers came from array indices; body headings mixed CSS counters with manually rendered numbers. Anchors such as cloud-compliance-aws kept the browser document navigable, but there was no single document tree preventing numbering or structure from drifting.",
            },
          ],
        },
        {
          id: "two-render-modes",
          heading: "Two Render Modes, One HTML Tree",
          blocks: [
            {
              type: "diagram",
              kind: "dual-render",
            },
            {
              type: "paragraph",
              text: "On screen, the report behaved like a document viewer: scrollable white pages, subtle shadows, and anchor-based TOC navigation. In print, @media print removed the screen treatment, enabled an A4-aware layout, revealed the fixed header, and activated page-break rules.",
              emphasis: ["@media print"],
            },
            {
              type: "list",
              items: [
                {
                  title: "Logical units",
                  text: "break-inside: avoid kept status cards and appendix records from splitting awkwardly.",
                },
                {
                  title: "Long tables",
                  text: "Rows resisted page breaks while thead { display: table-header-group } repeated context on each page.",
                },
                {
                  title: "Semantic boundaries",
                  text: "break-before: page started owner, cloud, and appendix sections cleanly; the TOC used break-after: page.",
                },
                {
                  title: "Generated furniture",
                  text: "@page margin boxes carried an SSR-baked timestamp and counter(page), with internal space reserved for the fixed header and footer.",
                },
              ],
            },
            {
              type: "callout",
              accent: "teal",
              text: "Print CSS was not a cleanup pass. It was the document layout engine layered over the same semantic report.",
            },
          ],
        },
        {
          id: "the-async-system",
          heading: "A Report Was a Job, Not a Request",
          blocks: [
            {
              type: "paragraph",
              text: "Generation was asynchronous. A user configured report scope, frameworks, filters, and optional email or Slack delivery, then returned to the product while the job moved through Generating, Completed, or Failed. Backend-owned retries and a manual Retry action handled failures without turning the create flow into a blocking screen.",
            },
            {
              type: "diagram",
              kind: "compliance-pipeline",
            },
            {
              type: "paragraph",
              text: "The frontend owned the rendering architecture, SSR route, report components, variants, and print behavior. The backend team owned report data, token issuance, job orchestration, Go + chromedp execution, PDF storage, retry lifecycle, and external delivery. The end-to-end feature was a collaboration, even though the browser-rendering direction was my proposal.",
              emphasis: ["frontend owned the rendering architecture"],
            },
          ],
        },
        {
          id: "the-production-boundary",
          heading: "The Document Worked. Its Placement Did Not.",
          blocks: [
            {
              type: "paragraph",
              text: "The reports matched the intended designs in development and smaller workloads. In production, however, the chromedp/Chromium path substantially increased memory pressure in the existing report-generation pod. A large customer workload eventually crossed its memory ceiling, the pod restarted, and automated PDF generation was rolled back.",
              emphasis: ["The reports matched the intended designs"],
            },
            {
              type: "metrics",
              items: [
                { value: "~250MB", label: "Remembered CSV baseline" },
                { value: "~700–900MB", label: "Remembered PDF workload" },
                { value: "~1GB", label: "Remembered pod ceiling" },
              ],
            },
            {
              type: "diagram",
              kind: "memory-blowup",
            },
            {
              type: "paragraph",
              text: "Those memory figures are historical recollections, not current monitoring evidence. The exact incident mix was never isolated: one exceptionally large report, concurrent renders, or both may have contributed. Browser reuse reduced startup overhead, but reuse alone did not provide resource backpressure.",
              emphasis: ["one exceptionally large report, concurrent renders, or both"],
            },
            {
              type: "callout",
              accent: "orange",
              text: "The lesson is not “Chromium can never generate PDFs.” It is that a browser renderer is a resource-intensive workload that needs an execution architecture with explicit capacity management.",
            },
          ],
        },
        {
          id: "what-survived",
          heading: "The Report Page Survived",
          blocks: [
            {
              type: "paragraph",
              text: "Automated server-side PDF generation was not re-enabled. The surviving production feature is the Next.js compliance-report page: five report variants, SSR data loading, shared sections, the TOC and anchors, A4-aware print styles, table pagination, headers, footers, and manual browser Print to PDF.",
            },
            {
              type: "paragraph",
              text: "That outcome matters because it separates two decisions that are easy to collapse. The document architecture solved the presentation and maintainability problem. The deployment model failed to safely contain the rendering workload.",
              emphasis: ["document architecture", "deployment model"],
            },
            {
              type: "callout",
              accent: "neutral",
              text: "It shipped, produced the right output, and exposed a production assumption that did not survive customer scale. The useful part stayed; the unsafe automation did not.",
            },
          ],
        },
        {
          id: "what-i-would-change",
          heading: "What I Would Change Today",
          blocks: [
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Scope the rendering credential",
                  text: "Use today's RBAC foundation to issue a very short-lived, least-privilege token limited to one report resource and the read operation required for rendering.",
                },
                {
                  num: "02",
                  title: "Create one document tree",
                  text: "Derive section order, anchors, TOC entries, numbering, and rendered content from the same typed structure instead of coordinating parallel systems by convention.",
                },
                {
                  num: "03",
                  title: "Bound the renderer",
                  text: "Move Chromium into dedicated workers with a queue, strict concurrency, timeouts, size limits, resource isolation, lifecycle monitoring, and capacity-aware autoscaling.",
                },
                {
                  num: "04",
                  title: "Benchmark Typst, do not assume it",
                  text: "Test design fidelity, complex tables, all five projections, render speed, memory, and preview requirements before treating a document-native renderer as the rewrite answer.",
                },
              ],
            },
            {
              type: "paragraph",
              text: "The async UX already made bounded queueing compatible with the product: users were expecting Generating, Completed, and Failed states rather than an immediate download. The missing work was operational backpressure, not a new interaction model.",
            },
            {
              type: "callout",
              accent: "blue",
              text: "Rendering architecture decides how a document is expressed. Execution architecture decides whether producing it is safe. This project taught me to design both explicitly.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "view-transitions",
    number: 3,
    title: "View Transitions: A Field Guide",
    description:
      "What the View Transitions API actually does — window + React, five variants, a live lab.",
    category: "creative",
    role: "Design + Dev",
    team: "Solo",
    shipped: "2025",
    status: "IN PROGRESS",
    tech: ["View Transitions", "CSS", "React", "Web APIs"],
    tilt: -0.8,
    thumbnail: {
      kind: "vt-cycle",
      accent: "cyan",
      alt: "View Transitions lab — cross-fade, clip reveal, and slide variants cycling on hover",
      params: { height: 240 },
    },
    note: "Field guide to the VT API — interactive lab of five transition variants.",
    caseStudy: {
      tagline:
        "You're already inside a View Transition — every navigation on this site is one. Here's the API behind it, the variants, and the traps, with a live lab to poke at.",
      tags: ["View Transitions", "CSS", "React", "Web APIs"],
      hero: { accent: "blue" },
      sections: [
        {
          id: "already-in-one",
          heading: "You're Already In One",
          blocks: [
            {
              type: "paragraph",
              text: "Every time you move between sections of this site, or open a case study, the browser isn't just swapping pages — it's running a View Transition. The slide, the circle reveal, the card that morphs into this page: all the same API.",
            },
            {
              type: "callout",
              accent: "blue",
              text: "This is a field guide, not a war story — what I learned wiring up this site, distilled into the variants and gotchas, with a live lab. The previews below are simulated (plain CSS/JS) so they stay contained; the real API code sits beside each one.",
            },
          ],
        },
        {
          id: "the-lab",
          heading: "The Lab",
          blocks: [
            {
              type: "paragraph",
              text: "Pick a variant, hit Run, and watch it play. Each tab pairs a simulated preview with the real View Transitions code that produces it.",
            },
            { type: "vtlab" },
          ],
        },
      ],
    },
  },
  {
    slug: "liquid-distortion",
    number: 4,
    title: "Liquid Distortion",
    description: "Three.js shader pass that warps imagery like viscous fluid.",
    category: "creative",
    role: "Creative Dev",
    team: "Solo",
    shipped: "2024",
    status: "IN PROGRESS",
    tech: ["Three.js", "GLSL", "React"],
    tilt: 0.5,
    thumbnail: {
      kind: "liquid-distortion",
      alt: "Liquid distortion playground with a warped cyan, teal, and violet momentum field",
      poster: "/posters/liquid-distortion.svg",
      params: { height: 228 },
    },
    note: "Shader distortion WIP — playground preview mounts on hover.",
    caseStudy: {
      tagline:
        "A liquid effect that does not simulate water so much as it borrows the one thing water makes visible: momentum.",
      tags: ["Three.js", "GLSL", "Shader Pass", "WebGL"],
      hero: { accent: "teal" },
      sections: [
        {
          id: "the-brief",
          heading: "The Brief",
          blocks: [
            {
              type: "paragraph",
              text: "I wanted a cursor effect that felt wet without turning into a full fluid solver. Something that could sit behind type, bend the image, and make fast movement feel different from slow movement.",
            },
            {
              type: "paragraph",
              text: "The first versions were too literal: circles following the cursor, displacement tied directly to pointer position, a ripple that looked the same no matter how you moved. It reacted, but it had no memory.",
              emphasis: ["no memory"],
            },
            {
              type: "callout",
              accent: "blue",
              text: "The effect started working when I stopped asking where the cursor is and started asking how hard it moved this frame.",
            },
          ],
        },
        {
          id: "momentum-not-position",
          heading: "Momentum, Not Position",
          blocks: [
            {
              type: "paragraph",
              text: "The simulation field stores velocity in a texture. Every frame, the pointer's displacement from its last position becomes the force injected into that field. A quick flick writes a stronger vector; a slow drag writes a softer one.",
              emphasis: ["velocity in a texture"],
            },
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Measure movement",
                  text: "Mouse velocity is just current UV minus last UV, scaled and clamped so fast swipes stay expressive without blowing up the field.",
                },
                {
                  num: "02",
                  title: "Splat into the field",
                  text: "A radial falloff injects that vector around the cursor. Aspect correction keeps the ripple circular inside any frame.",
                },
                {
                  num: "03",
                  title: "Let it settle",
                  text: "Dissipation and a small diffusion step make the vectors smear and fade instead of snapping back to zero.",
                },
              ],
            },
          ],
        },
        {
          id: "shader-pipeline",
          heading: "The Shader Pipeline",
          blocks: [
            {
              type: "paragraph",
              text: "There are two passes. The simulation pass evolves the velocity field in a pair of ping-pong render targets. The display pass samples that field and uses it to offset a procedural canvas texture.",
            },
            {
              type: "paragraph",
              text: "The content being distorted is intentionally simple: a gradient, a few color blooms, a dot grid, and large type. The dot grid makes small refractions legible, while the color blooms give the chromatic split something to bite into.",
              emphasis: ["dot grid", "chromatic split"],
            },
            {
              type: "callout",
              accent: "teal",
              text: "The field is not the image. The field is a map of motion. The image only becomes liquid when the display shader reads that map and bends the pixels through it.",
            },
          ],
        },
        {
          id: "playground",
          heading: "The Playground",
          blocks: [
            {
              type: "paragraph",
              text: "Swipe through the canvas, then change the controls. Trail controls how long the velocity field survives, distortion controls how far the texture bends, and ripple size controls how wide each pointer splat is.",
            },
            {
              type: "demo",
              id: "liquid-distortion",
              caption:
                "Move fast, move slow, then pull the controls apart. The force comes from cursor speed, not cursor position.",
            },
          ],
        },
        {
          id: "where-it-landed",
          heading: "Where It Landed",
          blocks: [
            {
              type: "metrics",
              items: [
                { value: "2", label: "Shader passes" },
                { value: "0.5x", label: "Simulation resolution" },
                { value: "3", label: "Live controls" },
              ],
            },
            {
              type: "paragraph",
              text: "The final version is deliberately not a physically complete fluid sim. It is a smaller illusion: advect a velocity texture, let it decay, and use that texture as a lens. That made it cheap enough for an article embed while still feeling responsive.",
              emphasis: ["a smaller illusion"],
            },
            {
              type: "callout",
              accent: "neutral",
              text: "The lesson was that believable interaction often comes from preserving the right state. Here, one frame of cursor history was the difference between a hover effect and something that felt like liquid.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "this-site",
    number: 5,
    title: "This Site",
    description:
      "Portfolio v2 — View Transitions, theme tokens, and tactile micro-interactions.",
    category: "creative",
    role: "Design + Dev",
    team: "Solo",
    shipped: "2025",
    status: "IN PROGRESS",
    tech: ["Next.js", "Tailwind", "GSAP", "View Transitions"],
    tilt: 1.3,
    thumbnail: {
      kind: "replay",
      accent: "cyan",
      alt: "Sliding active-bar nav — a cursor moves between items and the accent bar glides on hover",
      params: { height: 240 },
    },
    note: "This portfolio — live sliding-bar preview on hover; full View Transitions write-up inside.",
    caseStudy: {
      tagline:
        "I wanted a two-pixel bar to glide between nav items. It took five rewrites and a lesson in how browsers actually paint a page.",
      tags: ["View Transitions", "GSAP", "Next.js", "Tailwind"],
      hero: { accent: "teal" },
      sections: [
        {
          id: "the-bar",
          heading: "A Bar That Should Just Slide",
          blocks: [
            {
              type: "paragraph",
              text: "The section nav on this site has a sliding highlight on hover, and the page itself slides between sections using the View Transitions API. So when you move to a new section, the little accent bar marking the active item should glide from the old item to the new one — in the same motion as the page. A two-pixel sliver of color. Felt like a five-minute job.",
            },
            {
              type: "paragraph",
              text: "It was not a five-minute job. It was five rewrites, two wrong mental models, and one moment of realizing I'd been fighting the browser the whole time.",
              emphasis: ["five rewrites"],
            },
          ],
        },
        {
          id: "hover-vs-nav",
          heading: "Works on Hover, Dead on Navigation",
          blocks: [
            {
              type: "paragraph",
              text: "The first version was the obvious one: a CSS transition on transform, and a bit of JS to move the bar to the active item. On hover it slid beautifully. On an actual section change, it teleported — no slide, just instantly there.",
            },
            {
              type: "callout",
              accent: "orange",
              text: "The hover case and the navigation case looked identical in the code. They are not the same problem. Hovering happens on a live, painted page. Navigating happens inside a View Transition — and that changes everything about what the browser is willing to draw.",
            },
          ],
        },
        {
          id: "snapshot-trap",
          heading: "The Snapshot Trap",
          blocks: [
            {
              type: "paragraph",
              text: "Here's what a View Transition actually does. When you call startViewTransition, the browser freezes the current page into an image, swaps the DOM to the new page, freezes that into a second image, and animates between the two pictures. For the length of that animation, the real elements aren't what you're looking at — their snapshots are.",
              emphasis: ["startViewTransition", "snapshots"],
            },
            {
              type: "callout",
              accent: "blue",
              text: "A CSS transition running during a View Transition is a tree falling in an empty forest. The element does move — but the frame it moves on is never the frame on screen. You're animating a thing the browser has already replaced with a photo of itself.",
            },
          ],
        },
        {
          id: "chasing-timers",
          heading: "Chasing It With Timers",
          blocks: [
            {
              type: "paragraph",
              text: "So I tried to outwait it. Subscribe to a 'transition finished' event, then move the bar once the DOM was live again. It still jumped. I added the position-tracking, restored the CSS transition by hand, sequenced the frames — and it still jumped.",
            },
            {
              type: "paragraph",
              text: "The deeper problem was structural, and I'd been ignoring it. The sidebar isn't persistent. Each section is its own page rendering its own shell, so the entire nav unmounts and remounts on every navigation. There was no surviving bar to animate from — the new one mounted already sitting at its destination.",
              emphasis: ["no surviving bar to animate from"],
            },
          ],
        },
        {
          id: "stop-fighting",
          heading: "Stop Fighting the Platform",
          blocks: [
            {
              type: "paragraph",
              text: "The fix was to stop animating the bar myself and let the View Transition do it. The same machinery that slides the page can slide the bar — I just had to tell it the bar was worth tracking.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Name it",
                  text: "Give the bar a view-transition-name, so the browser treats it as its own element to pair across the old and new page. Scoped to the slide only, so it doesn't detach during the card → case-study morph where the whole sidebar moves as one piece.",
                },
                {
                  num: "02",
                  title: "Place it in the DOM",
                  text: "Render the bar inside the active list item instead of positioning it with JS. Now its location is correct in both snapshots automatically — the old page captures it on the old item, the new page on the new one. Zero measurement.",
                },
                {
                  num: "03",
                  title: "Delete the rest",
                  text: "The timers, the module-level position cache, the completion subscription, the manual transform math — all of it came out. The browser interpolates between the two captured positions for free.",
                },
              ],
            },
            {
              type: "diagram",
              kind: "vt-approaches",
            },
            {
              type: "demo",
              id: "sliding-bar",
              caption:
                "Click an item — the bar slides to it. Open 'How it works' for the markup + CSS.",
            },
            {
              type: "callout",
              accent: "teal",
              text: "DOM placement beat JS timing. The position I'd been computing by hand every navigation was already encoded in one fact: which list item the bar lived inside.",
            },
          ],
        },
        {
          id: "where-it-landed",
          heading: "Where It Landed",
          blocks: [
            {
              type: "paragraph",
              text: "Now the page slides and the accent bar glides to the new active item in the same gesture — same easing, same 480ms, one continuous motion. The only way to confirm it was the way that counts: watching it in a real browser, after the console logs showed the snapshot quietly doing the work I'd been trying to do by hand.",
              emphasis: ["480ms"],
            },
            {
              type: "metrics",
              items: [
                { value: "5", label: "Rewrites to get it right" },
                { value: "0", label: "JS positioning, final version" },
                { value: "480ms", label: "Shared with the page slide" },
              ],
            },
            {
              type: "callout",
              accent: "neutral",
              text: "The lesson wasn't really about View Transitions. It was about noticing when the platform already does the thing you're hand-rolling — and having the discipline to get out of its way.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "sso-alert-pipelines",
    number: 7,
    title: "SSO & Alert Pipelines",
    description:
      "SAML SSO for Google/Microsoft plus event-driven alerts to Slack, Jira, Coralogix, and S3.",
    category: "pro",
    role: "Full-Stack Engineer",
    team: "Platform Security",
    shipped: "2023",
    status: "COMING SOON",
    tech: ["SAML", "Node.js", "AWS", "Slack API"],
    tilt: -0.6,
  },
  {
    slug: "brush-reveal",
    number: 8,
    title: "Brush Reveal",
    description: "SVG mask animation along a hand-drawn centerline path.",
    category: "creative",
    role: "Creative Dev",
    team: "Solo",
    shipped: "2025",
    status: "COMING SOON",
    tech: ["SVG", "GSAP", "CSS Masks"],
    tilt: -0.9,
  },
  {
    slug: "fluid-sim",
    number: 9,
    title: "Fluid Simulation",
    description: "WebGL2 Navier–Stokes solver with interactive dye injection.",
    category: "creative",
    role: "Creative Dev",
    team: "Solo",
    shipped: "2024",
    status: "COMING SOON",
    tech: ["WebGL2", "GLSL", "TypeScript"],
    tilt: -1.5,
    // external: true,
    // href: "https://github.com/Somu050600",
  },
  {
    slug: "perf-pass",
    number: 10,
    title: "Performance Pass",
    description:
      "Bundle splitting, selective SSR/CSR, lazy loading, and caching — 30% TTI reduction.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Core Web",
    shipped: "2023",
    status: "COMING SOON",
    tech: ["Webpack", "React", "Lighthouse", "CDN"],
    tilt: 1.1,
  },

  // ── More (compact list) ────────────────────────────────────────────────────
  {
    slug: "wallet-rn",
    number: 11,
    title: "Wallet RN",
    description: "React Native expense tracker with offline-first sync.",
    category: "more",
    role: "Mobile Dev",
    team: "Solo",
    shipped: "2025",
    status: "OPEN SOURCE",
    tech: ["React Native", "SQLite"],
    external: true,
    href: "https://github.com/Somu050600/wallet-app",
  },
  {
    slug: "portfolio-v1",
    number: 12,
    title: "Portfolio - V1",
    description: "First Portfolio project",
    category: "more",
    role: "Frontend",
    team: "Self",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["React", "NextJs", "Tailwind"],
    external: true,
    href: "https://github.com/Somu050600/portfolio",
  },
  {
    slug: "are-we-there-yet",
    number: 13,
    title: "Are We There Yet",
    description: "Real-time trip tracker with ETA predictions.",
    category: "more",
    role: "Full-Stack",
    team: "Hackathon",
    shipped: "2026",
    status: "SHIPPED",
    tech: ["Mapbox", "Node.js", "WebSockets"],
    external: true,
    href: "https://github.com/Somu050600/wallet-app",
  },
  {
    slug: "node-bites",
    number: 14,
    title: "Node Bites",
    description:
      "The Food Explorer App is a React-based application that allows users to explore various meal categories, view meals within those categories, and see detailed information about selected meals.",
    category: "more",
    role: "Frontend",
    team: "Hackathon",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["React", "React Flow", "Tailwind"],
    external: true,
    href: "https://github.com/Somu050600/node-bites",
  },
  {
    slug: "photography-pipeline",
    number: 6,
    title:
      "Engineering a Photography Portfolio Without Sacrificing the Photographs",
    description:
      "A read-only image pipeline for responsive photographs, RAW previews, private metadata, and interactive 360° work.",
    category: "creative",
    role: "Frontend Engineer & Photographer",
    team: "Independent",
    shipped: "2026",
    status: "SHIPPED",
    tech: ["Next.js", "TypeScript", "Sharp", "Three.js"],
    tilt: 0.8,
    thumbnail: {
      kind: "image",
      poster:
        "/photos/generated/img-20181015-195513-01-358f1451/grid.webp",
      alt: "Low sunlight shines through a stone arch toward a garden.",
      params: { objectPosition: "center 52%" },
    },
    caseStudy: {
      tagline:
        "The hard part was not displaying twenty published photographs. It was preserving their detail, privacy, and 360-degree behavior without making every visitor download the archive.",
      tags: ["Image Pipeline", "Next.js", "Sharp", "Three.js"],
      hero: {
        image:
          "/photos/generated/20251219-000319-03a8c2a2/grid.webp",
        accent: "orange",
      },
      sections: [
        {
          id: "context",
          heading: "Photography Is Part of the Product",
          blocks: [
            {
              type: "paragraph",
              text: "This photography page lives inside a frontend-engineering portfolio. That makes image delivery part of the work itself: the photographs need to remain visually convincing while the page still behaves like a fast, accessible application.",
              emphasis: ["image delivery part of the work itself"],
            },
            {
              type: "paragraph",
              text: "The original gallery already had its contact-sheet layout, darkroom interactions, keyboard lightbox, responsive columns, and reduced-motion behavior. The implementation task was deliberately narrower: replace placeholder frames with a safe, reproducible asset system without redesigning the page.",
            },
          ],
        },
        {
          id: "problem",
          heading: "One Folder, Several Different Problems",
          blocks: [
            {
              type: "list",
              items: [
                {
                  title: "Large and inconsistent sources",
                  text: "The selected set totalled 172.5 MB across portrait, landscape, wide, alpha-channel PNG, JPEG, and DNG inputs.",
                },
                {
                  title: "Private metadata",
                  text: "Seven files exposed GPS markers. Camera and lens details could be useful; coordinates, serials, source paths, filenames, and editing identities could not enter the public bundle.",
                },
                {
                  title: "Different viewing contexts",
                  text: "A dense masonry grid, a small filmstrip, a full-screen viewer, and an 8K photosphere do not need the same bytes.",
                },
                {
                  title: "RAW and panorama branches",
                  text: "Two DNGs needed explicit fallback decisions, while two confirmed photospheres had to remain interactive rather than becoming flattened wide strips.",
                },
              ],
            },
          ],
        },
        {
          id: "constraints",
          heading: "Safety Before Cleverness",
          blocks: [
            {
              type: "callout",
              accent: "orange",
              text: "The source folder is read-only. The pipeline never renames, moves, edits, strips, or deletes an original; it verifies every source checksum again after processing.",
            },
            {
              type: "paragraph",
              text: "The first version stays local and static, keeps categories and tags empty, drafts factual alt text for review, uses no creative colour grading, never upscales, respects reduced motion, and loads panoramas only after a visitor opens one.",
            },
          ],
        },
        {
          id: "source-audit",
          heading: "What the Audit Actually Found",
          blocks: [
            {
              type: "metrics",
              items: [
                { value: "22", label: "Recognised photographs" },
                { value: "541 MP", label: "Source pixels audited" },
                { value: "7", label: "GPS-bearing sources" },
              ],
            },
            {
              type: "paragraph",
              text: "The set contained twenty standard rasters and two DNGs. GPano XMP confirmed two true equirectangular photospheres. Six other 2:1 files were flagged as possible panoramas for review, but they remain ordinary photographs because aspect ratio alone is not evidence of projection type.",
              emphasis: ["aspect ratio alone is not evidence"],
            },
            {
              type: "paragraph",
              text: "SHA-256 found no exact duplicate groups. Filename association and perceptual review identified two likely edit/original groups. Both user-confirmed duplicates are now excluded by checksum while their sources remain untouched.",
            },
          ],
        },
        {
          id: "architecture",
          heading: "One Deterministic Path, Three Processing Branches",
          blocks: [
            { type: "diagram", kind: "photography-pipeline" },
            {
              type: "paragraph",
              text: "A stable public ID combines a sanitized source stem with the first eight characters of its SHA-256 hash. The cache key combines the full source checksum, processing-profile version, Sharp version, and libvips version, so a warm rerun can skip unchanged work without relying on modification times.",
            },
          ],
        },
        {
          id: "standard-images",
          heading: "The Standard Raster Path",
          blocks: [
            {
              type: "paragraph",
              text: "Sharp 0.34.5 and libvips 8.17.3 apply EXIF orientation, flatten any alpha channel, convert to sRGB, and create four uncropped WebP roles. Thumb uses a 360 px long edge at quality 55; grid uses 1400 px at 72; viewer uses 2800 px at 84; and the 32 px placeholder uses quality 30.",
              emphasis: ["four uncropped WebP roles"],
            },
            {
              type: "paragraph",
              text: "Public derivatives use Sharp's default metadata-stripping behavior. Dominant colours come from the generated grid image for stable contact-sheet wells, while the tiny WebP placeholder becomes the viewer blur data URL. No creative sharpening or grading is applied.",
            },
          ],
        },
        {
          id: "dng-path",
          heading: "RAW Files Without Pretending",
          blocks: [
            {
              type: "paragraph",
              text: "The machine had no ExifTool, darktable, RawTherapee, or other full RAW developer. Both DNGs did expose sufficiently large embedded 8-bit previews: one at 3456 × 4608 after orientation and one at 1928 × 2560. The pipeline records both outcomes explicitly as extracted from embedded preview.",
              emphasis: ["extracted from embedded preview"],
            },
            {
              type: "callout",
              accent: "neutral",
              text: "A small thumbnail would have triggered manual conversion instead. The pipeline does not treat any decodable DNG payload as automatically suitable for a full-screen result.",
            },
          ],
        },
        {
          id: "panorama-path",
          heading: "Keeping the Photospheres Spherical",
          blocks: [
            {
              type: "paragraph",
              text: "Both confirmed panoramas retain an uncropped, 8192 px equirectangular JPEG at quality 88 with their GPano XMP re-injected after optimisation. Separate centre posters feed the thumb and grid roles, so browsing never downloads a compressed panoramic strip.",
            },
            {
              type: "paragraph",
              text: "The validator reopened both public panoramas, confirmed ProjectionType=equirectangular and UsePanoramaViewer=True, and measured normalized left/right seam scores of 0.0237 and 0.0249 against a 0.35 review threshold.",
            },
            {
              type: "paragraph",
              text: "When a panorama opens, Next.js dynamically loads the panorama component. That component then imports Three.js and requests the full equirectangular file. Until the texture is interactive, the normal poster remains visible as a fallback. Both photospheres now start at a 180-degree yaw from their previous default.",
            },
          ],
        },
        {
          id: "responsive-delivery",
          heading: "Download the Detail the Current Context Needs",
          blocks: [
            { type: "diagram", kind: "photo-delivery" },
            {
              type: "paragraph",
              text: "The grid sizes string mirrors the real two-, three-, and four-column layouts after page gutters. Only the first grid frame is eager and high-priority; the other nineteen are lazy. The filmstrip uses 360 px thumbs instead of repeating grid assets.",
            },
            {
              type: "paragraph",
              text: "The lightbox mounts only the active viewer asset. After that image decodes, a generation token starts prefetching the previous and next viewer files; rapid navigation invalidates stale work. Performance marks cover click-to-decode, adjacent readiness, and panorama open-to-interactive timing.",
            },
            {
              type: "paragraph",
              text: "Only the selected frame receives a temporary photo-active View Transition name. During open and close, that identity moves between the loaded grid image and the active viewer or panorama poster; keeping the other nineteen frames in the root snapshot prevents them from floating above the lightbox.",
            },
            {
              type: "paragraph",
              text: "The gallery does not use JavaScript virtualization. Next/Image already defers off-screen network work, and every frame reserves its aspect ratio, so unmounting masonry items would add observer state, blank back-scrolls, and repeat decodes for only twenty photographs. A scroll profile instead identified the route-wide Lenis 0.1 interpolation as the source of the heavy feeling, so Photography uses immediate scrolling while the rest of the portfolio keeps its smooth-scroll treatment.",
            },
          ],
        },
        {
          id: "privacy-accessibility",
          heading: "Privacy and Accessibility Share the Manifest Boundary",
          blocks: [
            {
              type: "paragraph",
              text: "The private audit keeps source paths, filenames, checksums, metadata findings, associations, warnings, and duplicate rationale outside public assets. The generated client manifest keeps only stable IDs, role URLs, dimensions, safe camera fields, colours, blur placeholders, and alt-review state.",
            },
            {
              type: "paragraph",
              text: "All twenty published items have visually reviewed factual alt drafts, but remain marked draft until final editorial approval. The grid reserves exact aspect ratios and exposes the same descriptions through its image-opening controls. Keyboard arrows, Escape, focus return, reduced motion, and the panorama poster fallback remain intact.",
            },
          ],
        },
        {
          id: "measurements",
          heading: "Measured Output, Not a Claimed Score",
          blocks: [
            {
              type: "metrics",
              items: [
                { value: "172.5 MB", label: "Source selection" },
                { value: "28.9 MB", label: "All public roles" },
                { value: "1.43 ms", label: "Warm pipeline rerun" },
              ],
            },
            {
              type: "paragraph",
              text: "Median source size was 6.55 MB. Median generated files were 8.8 KB for thumbs, 116 KB for grid, and 464 KB for standard viewers. Across role duplication, median per-photo reduction was 45.85% and average reduction was 57.92%.",
            },
            {
              type: "paragraph",
              text: "The two full panoramas account for 16.08 MB of the 28.9 MB output, which is why they are isolated behind interaction. The cold run took 28.53 seconds. The final warm run skipped all twenty published sources in 1.43 ms, reran the complete twenty-two-source audit, and validated all published outputs.",
            },
            {
              type: "paragraph",
              text: "A cache-disabled local production run at 1440 × 1000 transferred 1.18 MB initially, including 201 KB of image transfer, with zero initial layout shift and no panorama request. The active viewer decoded 63.2 ms after click, adjacent prefetch completed 9.6 ms later, and the panorama became interactive in 541 ms. At 390 × 844 with a 3× device scale and emulated 4G, the initial route transferred 1.75 MB, recorded a 1.31 s LCP, and again recorded zero layout shift. A 180 px wheel step reached 157 px in 10 ms and settled in 60 ms on Photography; the unchanged smooth route reached 35 px at 10 ms and remained at 150 px after 250 ms. These are local lab observations, not field performance claims.",
            },
          ],
        },
        {
          id: "decisions",
          heading: "Decisions and Rejected Alternatives",
          blocks: [
            {
              type: "list",
              items: [
                {
                  title: "Local assets over a CDN",
                  text: "Twenty published photographs fit a source-controlled workflow today. A CDN would add operational complexity before scale requires it.",
                },
                {
                  title: "WebP over AVIF",
                  text: "WebP keeps encoding fast and predictable in the existing Next.js path. No representative AVIF benchmark demonstrated a reason to add a second format in this pass.",
                },
                {
                  title: "Role-specific files over one master",
                  text: "The filmstrip, masonry grid, viewer, and panorama have materially different jobs. A single master would make the browser repeatedly decode or request unnecessary detail.",
                },
                {
                  title: "Adjacent prefetch over preload-all",
                  text: "Only two likely next images warm after the active frame is decoded. Hidden viewer files do not compete with initial grid delivery.",
                },
                {
                  title: "Interactive panoramas over flattened strips",
                  text: "The photospheres remain navigable photographs. Their larger files and rendering code are paid only by visitors who open them.",
                },
              ],
            },
          ],
        },
        {
          id: "tradeoffs",
          heading: "The Cost of Doing It Deliberately",
          blocks: [
            {
              type: "paragraph",
              text: "The system adds a processing profile, cache, typed manifest, private review artifacts, validation reports, and four common roles per standard photograph. That is more metadata and storage than copying one JPEG into public.",
            },
            {
              type: "paragraph",
              text: "Automatic RAW development remains intentionally conservative: embedded previews were adequate for this set, but future DNGs may require manual conversion or a dedicated developer. Panoramas remain the largest files, and alt text still needs human approval.",
            },
          ],
        },
        {
          id: "outcome",
          heading: "A Gallery With Context-Sized Detail",
          blocks: [
            {
              type: "paragraph",
              text: "The gallery now downloads the detail appropriate to browsing, inspecting, or exploring a photosphere. The complete public derivative set is 83% smaller than the untouched selection in aggregate, while the role-aware comparison accounts honestly for duplicated viewing roles at a 57.92% average per-photo reduction.",
              emphasis: ["detail appropriate to browsing, inspecting, or exploring a photosphere"],
            },
            {
              type: "paragraph",
              text: "More importantly, the originals remain unchanged, GPS never crosses the public boundary, layout space is known before download, and the two 360-degree photographs keep the interaction that makes them distinct.",
            },
          ],
        },
        {
          id: "next",
          heading: "What I Would Improve Next",
          blocks: [
            {
              type: "list",
              items: [
                {
                  title: "Editorial approval",
                  text: "Finalize the factual alt-text drafts after editorial review.",
                },
                {
                  title: "RAW consistency",
                  text: "Add a colour-managed RAW developer when the selection includes files whose embedded previews are not sufficient.",
                },
                {
                  title: "Curated viewing",
                  text: "Store focal points, collections, and per-panorama starting views only when they are deliberately authored.",
                },
                {
                  title: "Delivery scale",
                  text: "Move derivatives to an image CDN only when collection size or deployment cost makes local assets the limiting factor.",
                },
              ],
            },
          ],
        },
      ],
    },
  },
];

export const categoryLabels: Record<Exclude<Category, "more">, string> = {
  pro: "Professional",
  creative: "Creative",
};

export function getProjectsByCategory(category: Category): Project[] {
  return projects.filter((p) => p.category === category);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return projects.filter((p) => p.caseStudy && !p.external).map((p) => p.slug);
}

export function getIndexProjects(): Project[] {
  return projects.filter((p) => p.category !== "more");
}

export function getMoreProjects(): Project[] {
  return projects.filter((p) => p.category === "more");
}

export const accentCalloutStyles: Record<
  Accent,
  { bg: string; border: string; text: string }
> = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  teal: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-800 dark:text-teal-300",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-800 dark:text-orange-300",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-800 dark:text-green-300",
  },
  neutral: {
    bg: "bg-surface",
    border: "border-border-color",
    text: "text-ink-dim",
  },
};
