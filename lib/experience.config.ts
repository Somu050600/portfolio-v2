export interface Role {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
  stack: string[];
  integrations?: string[];
}

export const roles: Role[] = [
  {
    company: "Aurva",
    role: "Front-End Developer",
    start: "Oct 2024",
    end: "Present",
    location: "Bangalore",
    highlights: [
      "Built an AI-optimized design system with semantic tokens so generated UI stays consistent with production components.",
      "Shipped config-driven compliance reporting dashboards with SSR for faster, safer feature delivery.",
      "Integrated 6+ enterprise systems including SAML SSO for Google and Microsoft identity providers.",
      "Led a performance pass — bundle splitting, selective SSR/CSR, lazy routes, and caching.",
      "Owned reusable component architecture and mentored engineers on frontend patterns.",
    ],
    metrics: [
      { value: "−30%", label: "TTI" },
      { value: "−40%", label: "Feature time" },
      { value: "<1 wk", label: "UI delivery" },
      { value: "−50%", label: "Duplicate logic" },
      { value: "6+", label: "Integrations" },
    ],
    stack: [
      "React",
      "TypeScript",
      "Next.js",
      "Storybook",
      "Tailwind",
      "Node.js",
    ],
    integrations: [
      "Google",
      "Microsoft",
      "Slack",
      "Jira",
      "Coralogix",
      "S3",
    ],
  },
  {
    company: "CloudSEK",
    role: "Front-End Developer",
    start: "Apr 2024",
    end: "Sep 2024",
    location: "Bangalore",
    highlights: [
      "Developed data-intensive security dashboards in React, Next.js, and TypeScript.",
      "Improved render performance through memoization, dependency isolation, and selective subscriptions.",
      "Rolled out features behind flags for safer incremental releases.",
    ],
    metrics: [
      { value: "−25%", label: "Re-render cost" },
      { value: "12+", label: "Dashboard views" },
    ],
    stack: ["React", "Next.js", "TypeScript", "React Query", "Tailwind"],
  },
  {
    company: "MatBook",
    role: "Front-End Developer",
    start: "Sep 2023",
    end: "Mar 2024",
    location: "Remote",
    highlights: [
      "Delivered production React + TypeScript e-commerce and analytics experiences.",
      "Integrated Stripe checkout, OAuth flows, and third-party inventory APIs.",
      "Tuned CDN caching with S3 and CloudFront for static assets and product media.",
    ],
    metrics: [{ value: "+25%", label: "Checkout conversion" }],
    stack: [
      "React",
      "TypeScript",
      "Stripe",
      "AWS S3",
      "CloudFront",
      "REST",
    ],
  },
];
