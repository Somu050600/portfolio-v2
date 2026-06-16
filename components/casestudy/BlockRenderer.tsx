import Image from "next/image";
import type { Block } from "@/lib/projects.config";
import { accentCalloutStyles } from "@/lib/projects.config";
import { cn } from "@/lib/utils";

function TokenMismatchDiagram() {
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border-color bg-surface overflow-hidden">
        <p className="px-4 pt-3 pb-2 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          How tokens got lost in translation
        </p>
        <div className="flex flex-col md:flex-row items-stretch gap-px bg-border-color px-0 pb-0">
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">Figma variable</p>
            <code className="font-mono text-sm text-ink">color/Blue</code>
          </div>
          <div className="flex items-center justify-center bg-surface px-3 py-1 text-ink-faint text-sm font-mono md:py-3">
            →
          </div>
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">LLM assumes</p>
            <code className="font-mono text-sm text-ink">Tailwind blue-500</code>
          </div>
          <div className="flex items-center justify-center bg-surface px-3 py-1 text-ink-faint text-sm font-mono md:py-3">
            →
          </div>
          <div className="flex-1 bg-surface px-4 py-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint uppercase">Generated code</p>
            <code className="block font-mono text-sm text-red-500 line-through opacity-70">bg-blue-500</code>
            <code className="block font-mono text-sm text-green-600 dark:text-green-400">bg-av-blue-500</code>
          </div>
        </div>
        <p className="px-4 py-2.5 font-mono text-[9px] tracking-wide text-ink-faint">
          Same name, different hex — no error thrown, wrong color rendered.
        </p>
      </div>
    </figure>
  );
}

function ParagraphBlock({
  text,
  emphasis = [],
}: {
  text: string;
  emphasis?: string[];
}) {
  if (emphasis.length === 0) {
    return (
      <p className="text-base leading-relaxed text-ink-dim md:text-lg">{text}</p>
    );
  }

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const phrase of emphasis) {
    const idx = remaining.indexOf(phrase);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <em key={key++} className="text-ink not-italic font-medium">
        {phrase}
      </em>,
    );
    remaining = remaining.slice(idx + phrase.length);
  }
  if (remaining) parts.push(remaining);

  return (
    <p className="text-base leading-relaxed text-ink-dim md:text-lg">{parts}</p>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock text={block.text} emphasis={block.emphasis} />;

    case "image":
      return (
        <figure>
          <div
            className="relative w-full overflow-hidden rounded-xl border border-border-color"
            style={{ height: block.height ?? 360 }}
          >
            <Image
              src={block.src}
              alt={block.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2 font-mono text-xs text-ink-faint">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "callout": {
      const styles = accentCalloutStyles[block.accent];
      return (
        <aside
          className={cn(
            "rounded-xl border px-5 py-4 text-sm leading-relaxed md:text-base",
            styles.bg,
            styles.border,
            styles.text,
          )}
        >
          {block.text}
        </aside>
      );
    }

    case "list":
      if (block.ordered) {
        return (
          <ol className="flex flex-col gap-6">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-4">
                {item.num && (
                  <span className="shrink-0 font-mono text-sm text-ink-faint">
                    {item.num}
                  </span>
                )}
                <div>
                  {item.title && (
                    <p className="mb-1 font-serif text-lg text-ink">
                      {item.title}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-ink-dim md:text-base">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-ink-dim">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item.title && (
                <span className="font-medium text-ink">{item.title}: </span>
              )}
              {item.text}
            </li>
          ))}
        </ul>
      );

    case "metrics":
      return (
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {block.items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border-color bg-surface px-4 py-5">
              <dt className="font-mono text-xs tracking-wide text-ink-faint uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 font-serif text-3xl font-light text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "diagram":
      if (block.kind === "token-mismatch") return <TokenMismatchDiagram />;
      return null;

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  );
}
