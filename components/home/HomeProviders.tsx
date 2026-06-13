"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SettingsProvider, useSettings } from "@/components/settings/SettingsProvider";

const CommandPalette = dynamic(
  () => import("@/components/cmdk/CommandPalette"),
  { ssr: false },
);

const BuildModeBundle = dynamic(
  () => import("@/components/buildmode/BuildModeBundle"),
  { ssr: false },
);

function BuildModeLazy() {
  const { buildMode } = useSettings();
  if (!buildMode) return null;
  return <BuildModeBundle />;
}

export default function HomeProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      {children}
      <CommandPalette />
      <BuildModeLazy />
    </SettingsProvider>
  );
}
