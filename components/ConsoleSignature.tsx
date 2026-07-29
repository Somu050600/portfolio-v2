"use client";

import { useEffect } from "react";

let hasLogged = false;

export default function ConsoleSignature() {
  useEffect(() => {
    if (hasLogged) return;
    hasLogged = true;
    console.log(
      "You found the technical layer. Try holding Option or pressing F on the landing page.",
    );
  }, []);

  return null;
}
