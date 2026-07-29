import type { Metadata, Viewport } from "next";
import {
  DotGothic16,
  Geist,
  Glass_Antiqua,
  Source_Code_Pro,
} from "next/font/google";
import ConsoleSignature from "@/components/ConsoleSignature";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransitionProvider } from "@/lib/page-transition-context";
import { profile } from "@/lib/profile.config";
import { ACCENT_PREPAINT_SCRIPT } from "@/lib/theme.config";
import "./globals.css";
import "./brand-theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const glassAntiqua = Glass_Antiqua({
  variable: "--font-glass-antiqua",
  weight: "400",
  subsets: ["latin"],
});

/* Dot-matrix face for the headline's final word — reads as printed artefact
   against the engraved guilloché. */
const dotGothic = DotGothic16({
  variable: "--font-dot-gothic",
  weight: "400",
  subsets: ["latin"],
});

const description =
  "Frontend developer who treats the interface like the product. React, Next.js, TypeScript — design systems, performance, and tactile, motion-led UI.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.url),
  title: {
    default: "Somu — Frontend Developer",
    template: "%s · Somu",
  },
  description,
  applicationName: "Somu",
  authors: [{ name: profile.name, url: profile.url }],
  creator: profile.name,
  keywords: [
    "Frontend Developer",
    "Frontend Engineer",
    "React",
    "Next.js",
    "TypeScript",
    "Design Systems",
    "View Transitions",
    "Web Performance",
    profile.name,
    "Somu",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Somu",
    url: profile.url,
    title: "Somu — Frontend Developer",
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Somu — Frontend Developer",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f0e" },
  ],
};

// Runs synchronously before first paint:
//   1. Flags returning visitors so the intro overlay is hidden instantly.
//   2. Applies the correct accent CSS vars before React hydrates (no FOUC).
const introCheckScript = `try{if(sessionStorage.getItem("introSeen")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

// Person structured data — helps search/social understand who this site is.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.handle,
  url: profile.url,
  jobTitle: "Frontend Developer",
  email: `mailto:${profile.contact.email}`,
  sameAs: [profile.contact.github, profile.contact.linkedin],
  knowsAbout: [
    "Frontend Development",
    "React",
    "Next.js",
    "TypeScript",
    "Design Systems",
    "Web Performance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // next-themes + AccentProvider both mutate <html> before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${sourceCodePro.variable} ${glassAntiqua.variable} ${dotGothic.variable} h-full antialiased`}
    >
      <head>
        {/* Intro overlay pre-paint gate */}
        <script dangerouslySetInnerHTML={{ __html: introCheckScript }} />
        {/* Accent CSS vars pre-paint — prevents accent flash on reload */}
        <script dangerouslySetInnerHTML={{ __html: ACCENT_PREPAINT_SCRIPT }} />
        {/* Person structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <noscript>
          <style>{`[data-intro-overlay]{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PageTransitionProvider>
            <PageTransitionOverlay />
            {children}
          </PageTransitionProvider>
        </ThemeProvider>
        <ConsoleSignature />
      </body>
    </html>
  );
}
