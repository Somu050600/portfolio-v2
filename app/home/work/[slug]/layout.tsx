import type { ReactNode } from "react";
import { JetBrains_Mono, Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-cs-poppins",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-cs-jetbrains",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
});

export default function CaseStudyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${poppins.className} ${poppins.variable} ${jetBrainsMono.variable} [--font-mono:var(--font-cs-jetbrains)] [--font-sans:var(--font-cs-poppins)] [--font-serif:var(--font-cs-poppins)]`}
    >
      {children}
    </div>
  );
}
