import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import IntroProvider from "@/components/intro/IntroProvider";
import "./globals.css";

// Both signature SVG files are the single source of truth.
// Extracted at build time so the SVG files, not the component, own the data.

function readStrokePath(): string {
  const svg = readFileSync(
    join(process.cwd(), "assets/svg/signature-stroke.svg"),
    "utf-8",
  );
  const match = svg.match(/\bd="([^"]+)"/);
  if (!match) throw new Error("Could not extract path d from signature-stroke.svg");
  return match[1];
}

// Extracts inner SVG content (everything between the <svg> tags).
// Colors are owned by the SVG file itself — export with the correct fills.
function readFillContent(): string {
  const svg = readFileSync(
    join(process.cwd(), "assets/svg/signature-fill.svg"),
    "utf-8",
  );
  return svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Somu — Portfolio",
  description: "Personal portfolio",
};

// Runs synchronously before first paint: flags returning visitors (or
// reduced-motion users) on <html> so CSS can hide the intro overlay
// instantly, with no flash while waiting for React to hydrate.
const introCheckScript = `try{if(sessionStorage.getItem("introSeen")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const strokePath = readStrokePath();
  const fillContent = readFillContent();
  return (
    <html
      lang="en"
      // next-themes mutates the class on <html> before hydration
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introCheckScript }} />
        <noscript>
          <style>{`[data-intro-overlay]{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <IntroProvider strokePath={strokePath} fillContent={fillContent}>
            <Header />
            {children}
          </IntroProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
