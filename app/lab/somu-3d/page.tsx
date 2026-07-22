import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import SomuHero3D from "@/components/lab/SomuHero3D";

// The design ("Somu Hero 3D") is typeset in Newsreader (serif display) +
// IBM Plex Mono (UI). Loaded here rather than site-wide so this lab route
// carries its own type without touching the main theme's fonts.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Somu Hero 3D",
  description: "A 3D photographer's-viewfinder hero rendered in Three.js.",
  robots: { index: false, follow: false },
};

export default function SomuHero3DLabPage() {
  return (
    <SomuHero3D
      serifFont={newsreader.style.fontFamily}
      monoFont={ibmPlexMono.style.fontFamily}
    />
  );
}
