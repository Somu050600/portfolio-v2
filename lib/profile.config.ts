export const profile = {
  name: "Eega Somasekhara Reddy",
  handle: "Somu",
  alternateNames: ["Somu", "Somu Eega"],
  role: "Frontend developer",
  jobTitle: "Frontend Engineer",
  shortDescription:
    "Frontend engineer specialising in React, Next.js, TypeScript, design systems and web performance.",
  availability: "Open to work",
  timeZone: "Asia/Kolkata",
  /** Canonical production origin. Drives metadataBase, OG, sitemap, JSON-LD. */
  url: "https://eega.dev",
  tagline: "Frontend developer. I ship things that survive real data.",
  bio: "Building fast, tactile interfaces for the web.",
  narrative:
    "Came to frontend the long way: M.Sc. Chemistry + B.E. Civil at BITS Pilani, then fell for the craft of interfaces.",
  hero: {
    headline: "Design systems, performance, and the unglamorous middle",
    /**
     * MATCHED PAIR. See `landingConfig.hero.headline`. The opening clause is
     * verbatim from the splash headline; only the ending differs. Edit both or
     * neither.
     */
    guide:
      "Selected work below: what shipped, what scaled, and the one that took down Prod.",
  },
  contact: {
    email: "somasekhareega@gmail.com",
    github: "https://github.com/Somu050600",
    linkedin: "https://www.linkedin.com/in/somueega",
    phone: "tel:+91 6303955065",
    whatsapp: "https://wa.me/+916303955065",
    instagram: "https://www.instagram.com/somasekhareega/",
    twitter: "https://x.com/ESomu1",
    /**
     * Everything on the site links to our own origin. `/resume.pdf` streams the
     * Drive file below, so uploading a new version over the same Drive file is
     * still the only step needed to publish an updated resume.
     */
    resumeUrl: "/resume.pdf",
    resumeFileId: "1Xvqiygf1UUsfTJKhG4rcV6RylSBHIm9s",
    resumeViewerUrl:
      "https://drive.google.com/file/d/1Xvqiygf1UUsfTJKhG4rcV6RylSBHIm9s/view",
  },
} as const;
