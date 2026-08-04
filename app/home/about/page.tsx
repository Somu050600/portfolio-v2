import type { Metadata } from "next";
import AboutElements from "@/components/home/AboutElements";
import HomeShell from "@/components/home/HomeShell";
import { profile } from "@/lib/profile.config";

export const metadata: Metadata = {
  title: "About",
  description: profile.narrative,
};

export default function AboutPage() {
  return (
    <HomeShell showMobileFooter={false}>
      <AboutElements />
    </HomeShell>
  );
}
