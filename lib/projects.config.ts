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
  | { type: "diagram"; kind: "token-mismatch" };

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
  // ── Pro ──────────────────────────────────────────────────────────────────
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
      "SSR dashboards with config-driven forms — 40% faster feature delivery.",
    category: "pro",
    role: "Frontend Engineer",
    team: "Compliance Engineering",
    shipped: "2024",
    status: "SHIPPED",
    tech: ["Next.js", "TypeScript", "Zod", "SSR"],
    tilt: 0.8,
  },
  {
    slug: "sso-alert-pipelines",
    number: 3,
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
    slug: "perf-pass",
    number: 4,
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

  // ── Creative ───────────────────────────────────────────────────────────────
  {
    slug: "fluid-sim",
    number: 5,
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
    slug: "liquid-distortion",
    number: 6,
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
      kind: "generative",
      alt: "Liquid distortion preview",
      poster: "/posters/liquid-distortion.svg",
      params: { sketch: "fluid-dye", height: 228 },
    },
    note: "Shader distortion WIP — card uses shared fluid-dye sketch as preview.",
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
    slug: "this-site",
    number: 8,
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
    note: "This portfolio — cmdk palette, build mode, and circle-reveal nav included.",
  },

  // ── More (compact list) ────────────────────────────────────────────────────
  {
    slug: "wallet-rn",
    number: 9,
    title: "Wallet RN",
    description: "React Native expense tracker with offline-first sync.",
    category: "more",
    role: "Mobile Dev",
    team: "Solo",
    shipped: "2022",
    status: "OPEN SOURCE",
    tech: ["React Native", "SQLite"],
    external: true,
    href: "https://github.com/Somu050600",
  },
  {
    slug: "are-we-there-yet",
    number: 10,
    title: "Are We There Yet",
    description: "Real-time trip tracker with ETA predictions.",
    category: "more",
    role: "Full-Stack",
    team: "Hackathon",
    shipped: "2023",
    status: "SHIPPED",
    tech: ["Mapbox", "Node.js", "WebSockets"],
  },
  {
    slug: "flight-booking",
    number: 11,
    title: "Flight Booking UI",
    description: "Multi-step booking flow with fare comparison.",
    category: "more",
    role: "Frontend",
    team: "Internship",
    shipped: "2022",
    status: "INTERNSHIP",
    tech: ["React", "Redux", "REST"],
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
