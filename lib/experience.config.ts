export type Role = {
  company: string;
  role: string;
  domain: string;
  dateLabel: string;
  location: string;
  current?: boolean;
  summary: string;
  metrics: string[];
  bullets: string[];
  stack: string[];
};

export const roles: Role[] = [
  {
    company: "Aurva",
    role: "Front-End Developer",
    domain: "data security",
    dateLabel: "OCT 2024 — NOW",
    location: "BANGALORE",
    current: true,
    summary:
      "An AI-optimized design system with semantic tokens, config-driven compliance dashboards, and the enterprise integrations that make both sellable.",
    metrics: ["−30% TTI", "−40% feature time", "−50% duplicate logic"],
    bullets: [
      "Built an AI-optimized design system with semantic tokens so generated UI stays consistent with production components",
      "Shipped config-driven compliance reporting dashboards with SSR for faster, safer feature delivery",
      "Integrated 6+ enterprise systems including SAML SSO for Google and Microsoft identity providers",
      "Led a performance pass — bundle splitting, selective SSR/CSR, lazy routes, caching",
      "Owned reusable component architecture and mentored engineers on frontend patterns",
    ],
    stack: [
      "REACT",
      "TYPESCRIPT",
      "NEXT.JS",
      "STORYBOOK",
      "TAILWIND",
      "NODE.JS",
    ],
  },
  {
    company: "CloudSEK",
    role: "Front-End Developer",
    domain: "threat intelligence",
    dateLabel: "APR — SEP 2024",
    location: "BANGALORE",
    summary:
      "Data-intensive security dashboards, made to stay responsive under real payloads and released behind flags.",
    metrics: ["−25% re-render cost", "12+ dashboard views"],
    bullets: [
      "Developed data-intensive security dashboards in React, Next.js and TypeScript",
      "Improved render performance through memoization, dependency isolation and selective subscriptions",
      "Rolled out features behind flags for safer incremental releases",
    ],
    stack: ["REACT", "NEXT.JS", "TYPESCRIPT", "REACT QUERY", "TAILWIND"],
  },
  {
    company: "MatBook",
    role: "Front-End Developer",
    domain: "e-commerce",
    dateLabel: "SEP 2023 — MAR 2024",
    location: "REMOTE",
    summary:
      "Production storefront and analytics work — checkout, OAuth, inventory APIs, and the caching layer under all of it.",
    metrics: ["+25% checkout conversion"],
    bullets: [
      "Delivered production React + TypeScript e-commerce and analytics experiences",
      "Integrated Stripe checkout, OAuth flows and third-party inventory APIs",
      "Tuned CDN caching with S3 and CloudFront for static assets and product media",
    ],
    stack: ["REACT", "TYPESCRIPT", "STRIPE", "AWS S3", "CLOUDFRONT", "REST"],
  },
];
