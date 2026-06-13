import Image from "next/image";
import type { Block } from "@/lib/projects.config";
import { accentCalloutStyles } from "@/lib/projects.config";
import { cn } from "@/lib/utils";

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
