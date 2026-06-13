import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/home/PlaceholderPage";

export const metadata: Metadata = {
  title: "Playground — Somu",
};

export default function PlaygroundPage() {
  return (
    <PlaceholderPage
      title="Playground"
      description="Interactive experiments and sketches — WebGL, shaders, and motion studies."
    />
  );
}
