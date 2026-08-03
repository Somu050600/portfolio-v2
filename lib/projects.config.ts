export type Category = "pro" | "creative" | "more";
export type Status = "SHIPPED" | "INTERNSHIP" | "IN PROGRESS" | "OPEN SOURCE";
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
        | "vt-approaches";
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
      "PDF compliance reports rendered as web pages — designed to look right, ended up blowing up a prod.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Compliance Engineering",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["Next.js", "TypeScript", "Puppeteer", "SSR"],
    tilt: 0.8,
    thumbnail: {
      kind: "ascii",
      alt: "ASCII render of the compliance reporting pipeline",
      accent: "blue",
    },
    caseStudy: {
      tagline:
        "The report looked perfect. Then we deployed it to a client with real data and watched the pod ceiling disappear.",
      tags: ["PDF", "Puppeteer", "SSR", "Print CSS"],
      hero: { accent: "blue" },
      sections: [
        {
          id: "the-problem",
          heading: "The Brief",
          blocks: [
            {
              type: "paragraph",
              text: "Compliance reports needed to go out to customers — formatted, branded, printable PDFs. The backend is Go. The obvious path was a Go PDF library or a template renderer. We looked at it and quickly ruled it out.",
            },
            {
              type: "paragraph",
              text: "The design team had built detailed Figma layouts — multi-page reports with section headers, severity badges, data tables, coverage charts. Replicating that fidelity in a Go PDF template would've meant hand-coding every pixel of layout in a library that doesn't do CSS. That wasn't a week of work, it was a month, and it would break every time the design changed.",
            },
            {
              type: "callout",
              accent: "blue",
              text: "The question wasn't how to generate a PDF. It was how to turn a Figma design into a PDF without rebuilding it from scratch every sprint.",
            },
          ],
        },
        {
          id: "the-approach",
          heading: "The Approach",
          blocks: [
            {
              type: "paragraph",
              text: "We built it as a web page instead. The Go backend generates the report data, serializes it to JSON, creates a short-lived auth token, and hands both to Puppeteer. Puppeteer opens the Next.js report page — an unauthenticated route that accepts the token as a query param — and triggers a print.",
            },
            {
              type: "list",
              ordered: false,
              items: [
                {
                  title: "Unauth route with short-lived token",
                  text: "The report page is public but useless without the token. Token expires fast — just long enough for Puppeteer to load the page.",
                },
                {
                  title: "data.json via SSR",
                  text: "getServerSideProps fetches the report JSON from the backend using the token, parses it, and passes the full typed structure to the page.",
                },
                {
                  title: "5 template types",
                  text: "Owner-wise, cloud-wise, individual owner, individual cloud, and a default framework view — same page, different render path based on TemplateType in the data.",
                },
                {
                  title: "Ctrl+P simulation",
                  text: "Puppeteer calls page.pdf() which triggers the browser's print pipeline — @page margins, page-break rules, everything.",
                },
              ],
            },
            {
              type: "diagram",
              kind: "compliance-pipeline",
            },
            {
              type: "paragraph",
              text: "For the preview experience — when a user opens the report in a browser before downloading — we used @media print to make it feel like a document viewer, not a raw web page. The report header is hidden on screen and only appears in print. A4 dimensions, box shadows stripped, table rows protected from page breaks.",
              emphasis: ["@media print"],
            },
          ],
        },
        {
          id: "dual-render",
          heading: "Two Views, One Page",
          blocks: [
            {
              type: "diagram",
              kind: "dual-render",
            },
            {
              type: "paragraph",
              text: "One detail that's easy to miss: the same page serves two different audiences. A user previewing the report in their browser sees a clean document viewer — scrollable, white background, subtle card shadow. Puppeteer generating the PDF sees the print stylesheet — no shadow, exact A4 margins, auto section counters via CSS, page numbers injected via @page bottom-right.",
              emphasis: ["@page bottom-right"],
            },
            {
              type: "paragraph",
              text: "The generated timestamp in the PDF footer — 'Generated on Jun 12, 2024, 02:30 PM IST' — is injected as an inline <style> tag from the server with the actual time baked in. No client-side JS, no hydration gap. It's there when Puppeteer takes the snapshot.",
              emphasis: ["Generated on Jun 12, 2024, 02:30 PM IST"],
            },
            {
              type: "callout",
              accent: "teal",
              text: "@media print did a lot of heavy lifting here — it's not just 'hide the navbar.' It's the thing that makes the same HTML file work as both a browser preview and a pixel-accurate PDF.",
            },
          ],
        },
        {
          id: "what-went-wrong",
          heading: "Then It Hit Prod",
          blocks: [
            {
              type: "paragraph",
              text: "In development and early testing, it worked well. Report generation was fast, output looked exactly like the Figma designs, and the UX of previewing before downloading was noticeably better than anything we'd shipped before.",
            },
            {
              type: "paragraph",
              text: "Before this feature, the report-generation pod sat comfortably at around 250MB. After the first prod deploy — even with normal-sized reports — it jumped to 700–900MB. That was concerning, but the pod held.",
            },
            {
              type: "metrics",
              items: [
                { value: "~250MB", label: "Pod baseline (CSV reports)" },
                { value: "700–900MB", label: "After PDF feature deploy" },
                { value: "~1GB", label: "Pod memory ceiling" },
              ],
            },
            {
              type: "diagram",
              kind: "memory-blowup",
            },
            {
              type: "paragraph",
              text: "Then we deployed to a customer environment with a large dataset. Puppeteer spun up, loaded the report page, started rendering — and the pod ran out of memory mid-generation. The process died, the pod restarted, and every metrics dashboard turned red. We reverted the build the same day.",
              emphasis: ["every metrics dashboard turned red"],
            },
            {
              type: "callout",
              accent: "orange",
              text: "Puppeteer isn't just a HTTP call. It's a full Chromium instance. Every concurrent report is a browser tab eating memory — and with large compliance datasets, each tab was enormous.",
            },
            {
              type: "paragraph",
              text: "The fix wasn't complicated in hindsight: headless rendering at scale belongs on the client, not inside a backend pod with a 1GB ceiling. When the user's browser renders the page and triggers print, the memory cost is theirs. When the server does it, the memory cost is yours — multiplied by every concurrent request.",
            },
          ],
        },
        {
          id: "where-it-landed",
          heading: "Where It Landed",
          blocks: [
            {
              type: "paragraph",
              text: "Server-side PDF generation is off. The compliance report page still exists and still works — users can open it in a browser, preview it, and print to PDF themselves. The Figma designs, the dual-render pattern, the five template types — all of that is intact.",
            },
            {
              type: "paragraph",
              text: "Server-side report generation now handles only CSV exports, the same as before. A proper fix — either a dedicated PDF microservice with tighter resource controls, or moving to a client-triggered download — is on the backlog.",
            },
            {
              type: "callout",
              accent: "neutral",
              text: "It shipped, it looked great, it blew up a pod. That's a real outcome. The architecture wasn't wrong for the problem — it was wrong for the deployment context.",
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
    number: 6,
    title: "SSO & Alert Pipelines",
    description:
      "SAML SSO for Google/Microsoft plus event-driven alerts to Slack, Jira, Coralogix, and S3.",
    category: "pro",
    role: "Full-Stack Engineer",
    team: "Platform Security",
    shipped: "2023",
    status: "SHIPPED",
    tech: ["SAML", "Node.js", "AWS", "Slack API"],
    tilt: -0.6,
  },
  {
    slug: "brush-reveal",
    number: 7,
    title: "Brush Reveal",
    description: "SVG mask animation along a hand-drawn centerline path.",
    category: "creative",
    role: "Creative Dev",
    team: "Solo",
    shipped: "2025",
    status: "SHIPPED",
    tech: ["SVG", "GSAP", "CSS Masks"],
    tilt: -0.9,
  },
  {
    slug: "fluid-sim",
    number: 8,
    title: "Fluid Simulation",
    description: "WebGL2 Navier–Stokes solver with interactive dye injection.",
    category: "creative",
    role: "Creative Dev",
    team: "Solo",
    shipped: "2024",
    status: "OPEN SOURCE",
    tech: ["WebGL2", "GLSL", "TypeScript"],
    tilt: -1.5,
    external: true,
    href: "https://github.com/Somu050600",
    thumbnail: {
      kind: "generative",
      alt: "Fluid simulation preview",
      poster: "/posters/fluid-dye.svg",
      params: { sketch: "fluid-dye", height: 240 },
    },
    note: "Card-mount fluid dye sketch — also a full-screen playground experiment.",
  },
  {
    slug: "perf-pass",
    number: 9,
    title: "Performance Pass",
    description:
      "Bundle splitting, selective SSR/CSR, lazy loading, and caching — 30% TTI reduction.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Core Web",
    shipped: "2023",
    status: "SHIPPED",
    tech: ["Webpack", "React", "Lighthouse", "CDN"],
    tilt: 1.1,
    thumbnail: {
      kind: "image",
      alt: "Performance Pass preview",
      poster: "/posters/design-system.svg",
      params: { height: 200 },
    },
  },

  // ── More (compact list) ────────────────────────────────────────────────────
  {
    slug: "wallet-rn",
    number: 10,
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
    number: 11,
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
    number: 12,
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
    number: 13,
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
