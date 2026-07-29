// Single source of truth for landing copy and intro timing.
// The signature reveal values are intentionally unchanged.

export const landingConfig = {
  intro: {
    runOncePerSession: process.env.NEXT_PUBLIC_INTRO_ONCE === "true",
    drawMs: 2800,
    holdMs: 300,
    slideUpMs: 1100,
    slideUpEase: "power4.inOut",
  },
  hero: {
    headline: [
      "Clarity in interface.",
      "Depth in systems.",
      "Beautifully.",
    ],
    role: "Frontend Engineer",
    specialties: "React · Next.js · Design Systems · Performance",
    ctaLabel: "EXPLORE",
    ctaTarget: "/home",
  },
} as const;
