import type { Metadata } from "next";
import Link from "next/link";
import { homeNavItems } from "@/lib/home.config";
import { typeStyles } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

/**
 * 404 with the site's own chrome and a route back into the work, rather than
 * the framework default. Every section is one click away, so a stale or
 * mistyped URL is a detour instead of a dead end.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-bg px-6 py-20 text-ink md:px-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <p className="font-mono text-metadata leading-none font-semibold tracking-[0.18em] text-accent uppercase">
          404 · NO SUCH FRAME
        </p>
        <h1 className={`${typeStyles.pageTitle} text-balance text-ink`}>
          This page was never exposed.
        </h1>
        <p className={`${typeStyles.bodySmall} max-w-[52ch] text-ink-dim`}>
          The URL does not resolve. Placeholder pages were removed on purpose,
          so an old link may point at one of them.
        </p>
        <nav aria-label="Site sections" className="flex flex-col gap-2 pt-2">
          {homeNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex items-baseline gap-2.5"
            >
              <span className="w-4 shrink-0 font-mono text-metadata leading-none font-medium text-ink-faint tabular-nums group-hover:text-accent">
                {item.ordinal}
              </span>
              <span className="font-body text-[20px] leading-[1.15] font-semibold tracking-[-0.035em] text-ink-faint group-hover:text-ink">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
