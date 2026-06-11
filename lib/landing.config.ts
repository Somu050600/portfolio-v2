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
    /** serif display title, one entry per word (each word gets cursor shove) */
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
    eyebrow: "WELCOME TO",
    // TODO: replace with your final title phrase
    title: ["Somu's ", " World"],
    ctaLabel: "EXPLORE",
    showSkip: true,
    skipLabel: "skip intro",
    skipTarget: "/home",
    // TODO: replace with your final dev-flavored quote
    quote: [
      { text: "great" },
      { text: "interfaces", emphasis: true },
      { text: "feel" },
      { text: "obvious" },
      { text: "—" },
      { text: "the" },
      { text: "craft", emphasis: true },
      { text: "is" },
      { text: "everything" },
      { text: "you" },
      { text: "don't" },
      { text: "notice.", emphasis: true },
    ],
  },

  scenery: {
    starfield: {
      layers: [
        // Far: sparse tiny dim stars, slowest rotation
        {
          seed: 17,
          grid: 12,
          maxRadius: 45,
          skipChance: 0.22,
          size: [0.8, 1, 1.5],
          opacity: [0.25, 0.5],
          rotationS: 360,
          reverse: true,
        },
        // Mid: a handful of mid-brightness stars
        {
          seed: 53,
          grid: 10,
          maxRadius: 38,
          skipChance: 0.28,
          size: [0.65, 1.5, 2],
          opacity: [0.45, 0.7],
          rotationS: 260,
        },
        // Near: few brighter stars clustered near center
        {
          seed: 91,
          grid: 9,
          maxRadius: 30,
          skipChance: 0.32,
          size: [0.5, 2, 2.5],
          opacity: [0.6, 0.9],
          rotationS: 190,
          reverse: true,
        },
      ],
    },
    shootingStars: {
      firstDelayMs: 800,
      minDelayMs: 4000,
      maxDelayMs: 7000,
      // Trail FIRST, star LAST — after rotation the star leads the trajectory.
      shapes: ["──────✦", "─────·", "──────⋆", "·─────✦", "─────˚"],
    },
  },

  statusClock: {
    enabled: true,
    statusLabel: "ALL SYSTEMS OPERATIONAL",
  },

  interaction: {
    shoveRadius: 95,
    shoveStrength: 26,
    shoveLerp: 0.18,
    parallaxMax: 18,
    cursorLerp: 0.35,
  },

  enterTransition: {
    coverMs: 1000,
    coverEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    revealMs: 400,
  },
};
