import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/home/PlaceholderPage";

export const metadata: Metadata = {
  title: "Experience — Somu",
};

export default function ExperiencePage() {
  return (
    <PlaceholderPage
      title="Experience"
      description="Work history, roles, and the path from chemistry labs to component libraries."
    />
  );
}
