"use client";

import { profile } from "@/lib/profile.config";
import { useEffect } from "react";

// figlet "ANSI Shadow" — SOMU
const BANNER = String.raw`
 ███████╗ ██████╗ ███╗   ███╗██╗   ██╗
 ██╔════╝██╔═══██╗████╗ ████║██║   ██║
 ███████╗██║   ██║██╔████╔██║██║   ██║
 ╚════██║██║   ██║██║╚██╔╝██║██║   ██║
 ███████║╚██████╔╝██║ ╚═╝ ██║╚██████╔╝
 ╚══════╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ `;

/**
 * A tasteful DevTools greeting — devs open the console on a frontend portfolio.
 * Logged once on mount, like a CLI splash.
 */
export default function ConsoleSignature() {
  useEffect(() => {
    const banner =
      "color:#b85423;font:600 11px/1.15 ui-monospace,SFMono-Regular,monospace";
    const sub =
      "color:#8a8175;font:12px ui-monospace,monospace;padding-top:4px";
    const link = "color:#2a2620;font:12px ui-monospace,monospace";
    console.log(
      `%c${BANNER}\n%cFrontend developer — interfaces that survive real data.\nBuilt with Next.js, View Transitions & GSAP.\n%c${profile.url}  ·  ${profile.contact.github}`,
      banner,
      sub,
      link,
    );
  }, []);

  return null;
}
