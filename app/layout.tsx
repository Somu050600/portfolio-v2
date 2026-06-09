import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import IntroProvider from "@/components/intro/IntroProvider";
import "./globals.css";

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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introCheckScript }} />
        <noscript>
          <style>{`[data-intro-overlay]{display:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <IntroProvider>{children}</IntroProvider>
      </body>
    </html>
  );
}
