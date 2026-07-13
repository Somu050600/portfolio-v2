// Single source of truth for all landing-page copy and scenery tuning.
// No copy or magic numbers in JSX — edit here.

export type QuoteWord = {
  text: string;
  emphasis?: boolean;
};

export type StarLayer = {
  /** mulberry32 seed — deterministic so SSR and client render identically */
  seed: number;
  /** stars are placed on a grid x grid lattice, then jittered */
  grid: number;
  /** stars outside this radius (in % from center) are dropped */
  maxRadius: number;
  /** chance a lattice cell stays empty */
  skipChance: number;
  /** [chance of small size, small px, large px] */
  size: [number, number, number];
  /** [min, max] star opacity */
  opacity: [number, number];
  /** full-rotation duration in seconds */
  rotationS: number;
  /** rotate the opposite way so the sky doesn't spin as one sheet */
  reverse?: boolean;
};

export type SparkleConfig = {
  /** number of particles per click (random between min and max) */
  countMin: number;
  countMax: number;
  /** px/s speed range */
  speedMin: number;
  speedMax: number;
  /** lifetime ms range */
  lifeMin: number;
  lifeMax: number;
  /** particle radius range in px */
  rMin: number;
  rMax: number;
};

export type LandingConfig = {
  intro: {
    /** gate behind env so dev sees the intro every load */
    runOncePerSession: boolean;
    drawMs: number;
    holdMs: number;
    slideUpMs: number;
    slideUpEase: string;
  };
  hero: {
    eyebrow: string;
    /** display title, one entry per word */
    title: string[];
    ctaLabel: string;
    showSkip: boolean;
    skipLabel: string;
    skipTarget: string;
    quote: QuoteWord[];
  };
  scenery: {
    starfield: { layers: StarLayer[] };
    shootingStars: {
      firstDelayMs: number;
      minDelayMs: number;
      maxDelayMs: number;
      shapes: string[];
    };
    sparkles: SparkleConfig;
  };
  statusClock: {
    enabled: boolean;
    statusLabel: string;
  };
  interaction: {
    /** px radius around the cursor in which words get shoved */
    shoveRadius: number;
    /** max px push at zero distance */
    shoveStrength: number;
    /** lerp factor for shove spring-back */
    shoveLerp: number;
    /** max px parallax drift at viewport edge */
    parallaxMax: number;
    /** lerp factor for the trailing cursor */
    cursorLerp: number;
  };
  /** Per-character "flashlight" spotlight on the hero title */
  spotlight: {
    /** px radius of the spotlight falloff */
    radius: number;
    /** minimum opacity for fully-dimmed glyphs (0–1) */
    dimFloor: number;
    /** lerp factor for the per-char proximity easing */
    ease: number;
    /** tight bright core blur radius (px, at full proximity) */
    glowCorePx: number;
    /** wider soft bloom blur radius (px, at full proximity) */
    glowBloomPx: number;
  };
  enterTransition: {
    coverMs: number;
    coverEase: string;
    revealMs: number;
  };
};

export const landingConfig: LandingConfig = {
  intro: {
    runOncePerSession: process.env.NEXT_PUBLIC_INTRO_ONCE === "true",
    drawMs: 2800,
    holdMs: 300,
    slideUpMs: 1100,
    slideUpEase: "power4.inOut",
  },

  hero: {
    eyebrow: "SOMU / FRONTEND ENGINEER",
    title: ["I build interfaces that stay simple as products get complicated."],
    ctaLabel: "VIEW SELECTED WORK",
    showSkip: true,
    skipLabel: "skip intro",
    skipTarget: "/home",
    quote: [
      { text: "React" },
      { text: "·" },
      { text: "Next.js" },
      { text: "·" },
      { text: "Design systems", emphasis: true },
      { text: "·" },
      { text: "Performance" },
    ],
  },

  scenery: {
    starfield: {
      layers: [
        {
          seed: 17,
          grid: 16,
          maxRadius: 48,
          skipChance: 0.52,
          size: [0.86, 0.8, 1.2],
          opacity: [0.12, 0.3],
          rotationS: 560,
          reverse: true,
        },
        {
          seed: 53,
          grid: 12,
          maxRadius: 43,
          skipChance: 0.62,
          size: [0.78, 1, 1.5],
          opacity: [0.18, 0.38],
          rotationS: 440,
        },
        {
          seed: 91,
          grid: 10,
          maxRadius: 52,
          skipChance: 0.7,
          size: [0.68, 1.2, 1.8],
          opacity: [0.28, 0.52],
          rotationS: 360,
          reverse: true,
        },
      ],
    },
    shootingStars: {
      firstDelayMs: 120000,
      minDelayMs: 120000,
      maxDelayMs: 180000,
      shapes: ["──────✦"],
    },
    sparkles: {
      countMin: 0,
      countMax: 0,
      speedMin: 0,
      speedMax: 0,
      lifeMin: 0,
      lifeMax: 0,
      rMin: 0,
      rMax: 0,
    },
  },

  statusClock: {
    enabled: true,
    statusLabel: "FRONTEND ENGINEER AT AURVA",
  },

  interaction: {
    shoveRadius: 95,
    shoveStrength: 0,
    shoveLerp: 0.18,
    parallaxMax: 10,
    cursorLerp: 0.35,
  },

  spotlight: {
    radius: 190,
    dimFloor: 0.5,
    ease: 0.14,
    glowCorePx: 8,
    glowBloomPx: 18,
  },

  enterTransition: {
    coverMs: 1000,
    coverEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    revealMs: 400,
  },
};
