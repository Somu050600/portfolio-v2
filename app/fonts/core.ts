import { JetBrains_Mono, Poppins, Roboto_Condensed } from "next/font/google";

export const displayFont = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  weight: "variable",
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const bodyFont = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
});

export const coreFontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`;
