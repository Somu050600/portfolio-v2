import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/home/PlaceholderPage";

export const metadata: Metadata = {
  title: "About — Somu",
};

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About"
      description="The longer story — BITS Pilani, the pivot to frontend, and what I'm optimizing for next."
    />
  );
}
