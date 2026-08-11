/**
 * First tab stop on pages that put a full menu (plus search and social links)
 * ahead of the <h1>. Invisible until focused.
 */
export default function SkipLink({
  targetId = "main-content",
}: {
  targetId?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:border focus:border-accent focus:bg-bg focus:px-4 focus:py-2 focus:font-mono focus:text-metadata focus:tracking-widest focus:text-ink focus:uppercase"
    >
      Skip to content
    </a>
  );
}
