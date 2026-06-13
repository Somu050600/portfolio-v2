export type Category = "pro" | "creative" | "more";
export type Status = "SHIPPED" | "INTERNSHIP" | "IN PROGRESS" | "OPEN SOURCE";
export type Accent = "blue" | "teal" | "orange" | "green" | "neutral";

type Preview = {
  kind: "image";
  src: string;
  height?: number;
  position?: string;
};

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
  | { type: "metrics"; items: { value: string; label: string }[] };

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
  preview?: Preview;
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
    caseStudy: {
      tagline: "From two-week UI cycles to under one week — without sacrificing craft.",
      tags: ["Design Systems", "Tokens", "React", "Storybook"],
      hero: { accent: "teal" },
      sections: [
        {
          id: "context",
          heading: "Context",
          blocks: [
            {
              type: "paragraph",
              text: "Product teams were shipping features faster than design could keep up. Every screen started from scratch — inconsistent spacing, one-off colors, and hand-rolled components that drifted from the Figma source of truth within a sprint.",
            },
            {
              type: "callout",
              accent: "teal",
              text: "The goal wasn't a prettier component gallery — it was shrinking the gap between design intent and production UI.",
            },
          ],
        },
        {
          id: "approach",
          heading: "Approach",
          blocks: [
            {
              type: "paragraph",
              text: "I built a token-first pipeline: Figma variables export to JSON, a build step generates CSS custom properties and TypeScript theme objects, and Storybook documents every component variant with visual regression hooks.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                {
                  num: "01",
                  title: "Audit",
                  text: "Mapped 40+ ad-hoc color/spacing usages across three apps into a single semantic token set.",
                },
                {
                  num: "02",
                  title: "Primitives",
                  text: "Shipped Button, Input, Select, and layout primitives with strict accessibility contracts.",
                },
                {
                  num: "03",
                  title: "Adoption",
                  text: "Paired with feature teams on two pilot flows, then rolled out via codemods and lint rules.",
                },
              ],
            },
          ],
        },
        {
          id: "impact",
          heading: "Impact",
          blocks: [
            {
              type: "metrics",
              items: [
                { value: "<1 wk", label: "UI delivery (was 2–3 wk)" },
                { value: "40+", label: "Shared components" },
                { value: "3", label: "Apps on one token set" },
              ],
            },
            {
              type: "paragraph",
              text: "Teams stopped debating hex values in PRs. New engineers onboarded through Storybook instead of hunting through legacy CSS. The system became the default path — not an optional upgrade.",
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
  return projects
    .filter((p) => p.caseStudy && !p.external)
    .map((p) => p.slug);
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
