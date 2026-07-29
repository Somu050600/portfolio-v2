"use client";

import { useEffect } from "react";

let hasLogged = false;

export default function ConsoleSignature() {
  useEffect(() => {
    if (hasLogged) return;
    hasLogged = true;
    console.log(
      [
        "Landing page interactions:",
        "  ⌥ (hold)   technical layer",
        "  F          lock focus on a headline line",
        "  develop    semantic layer (2s)",
        "  dbl-click  cycle paper temperature",
      ].join("\n"),
    );
  }, []);

  return null;
}
