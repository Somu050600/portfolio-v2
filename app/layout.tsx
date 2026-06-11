import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Glass_Antiqua, Source_Code_Pro } from "next/font/google";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import { PageTransitionProvider } from "@/lib/page-transition-context";
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

// Runs synchronously before first paint: flags returning visitors (or
// reduced-motion users) on <html> so CSS can hide the intro overlay
// instantly, with no flash while waiting for React to hydrate.
const introCheckScript = `try{if(sessionStorage.getItem("introSeen")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // next-themes mutates the class on <html> before hydration
      suppressHydrationWarning
      className={`${geistSans.variable} ${sourceCodePro.variable} ${glassAntiqua.variable} h-full antialiased`}
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
          <PageTransitionProvider>
            <PageTransitionOverlay />
            {children}
          </PageTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
