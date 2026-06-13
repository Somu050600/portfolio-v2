"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/settings/SettingsProvider";
import InspectOverlay from "./InspectOverlay";
import PerfHUD from "./PerfHUD";
import CommentaryBadges from "./CommentaryBadges";

function BuildModeEscapeListener() {
  const { buildMode, setBuildMode, commandOpen } = useSettings();

  useEffect(() => {
    if (!buildMode) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (commandOpen) return;
      if (document.documentElement.hasAttribute("data-theme-customizer-open")) {
        return;
      }
      setBuildMode(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buildMode, commandOpen, setBuildMode]);

  return null;
}

export default function BuildModeBundle() {
  return (
    <>
      <BuildModeEscapeListener />
      <InspectOverlay />
      <PerfHUD />
      <CommentaryBadges />
    </>
  );
}
