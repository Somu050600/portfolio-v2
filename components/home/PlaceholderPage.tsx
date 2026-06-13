import type { ReactNode } from "react";
import HomeShell from "@/components/home/HomeShell";

type PlaceholderPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <HomeShell>
      <main className="flex min-h-screen flex-col justify-center px-6 py-16 md:px-12 lg:px-16">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
          Coming in Prompt 2
        </p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-dim md:text-base">
          {description}
        </p>
        {children}
      </main>
    </HomeShell>
  );
}
