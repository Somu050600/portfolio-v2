import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export const metadata: Metadata = {
  title: "Home — Somu",
};

// Stub: the real /home is built separately. Reached via the landing page's
// EXPLORE transition (or its skip link).
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
