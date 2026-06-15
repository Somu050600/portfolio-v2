import type { Metadata } from "next";
import { Geist, Glass_Antiqua, Source_Code_Pro } from "next/font/google";
import BrowserNativeTransitions from "@/components/BrowserNativeTransitions";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransitionProvider } from "@/lib/page-transition-context";
import { ACCENT_PREPAINT_SCRIPT } from "@/lib/theme.config";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Somu — Portfolio",
  description: "Personal portfolio",
};

// Runs synchronously before first paint:
//   1. Flags returning visitors so the intro overlay is hidden instantly.
//   2. Applies the correct accent CSS vars before React hydrates (no FOUC).
const introCheckScript = `try{if(sessionStorage.getItem("introSeen")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

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
      className={`${geistSans.variable} ${sourceCodePro.variable} ${glassAntiqua.variable} h-full antialiased`}
    >
      <head>
        {/* Intro overlay pre-paint gate */}
        <script dangerouslySetInnerHTML={{ __html: introCheckScript }} />
        {/* Accent CSS vars pre-paint — prevents accent flash on reload */}
        <script dangerouslySetInnerHTML={{ __html: ACCENT_PREPAINT_SCRIPT }} />
        <noscript>
          <style>{`[data-intro-overlay]{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PageTransitionProvider>
            <PageTransitionOverlay />
            <BrowserNativeTransitions>{children}</BrowserNativeTransitions>
          </PageTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
