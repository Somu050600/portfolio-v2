import HomeProviders from "@/components/home/HomeProviders";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Poppins,
} from "next/font/google";
import type { ReactNode } from "react";

const homePoppins = Poppins({
  variable: "--font-home-poppins",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
});

const homeJetBrainsMono = JetBrains_Mono({
  variable: "--font-home-jetbrains",
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
});

const homeInstrumentSerif = Instrument_Serif({
  variable: "--font-home-instrument",
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeProviders>
      <div
        className={`${homePoppins.variable} ${homeJetBrainsMono.variable} ${homeInstrumentSerif.variable}`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </div>
    </HomeProviders>
  );
}
