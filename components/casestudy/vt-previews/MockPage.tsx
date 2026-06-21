/** A page skeleton used by the clip + slide previews. The two tones use
 *  different layouts so a reveal/slide between them is clearly visible. */
export default function MockPage({
  tone,
  label,
}: {
  tone: "a" | "b";
  label: string;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-2 bg-elevated p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          {label}
        </span>
        <span
          className={
            tone === "a"
              ? "h-2 w-2 rounded-full bg-ink-faint"
              : "h-2 w-2 rounded-full bg-accent"
          }
        />
      </div>

      {tone === "a" ? (
        <>
          <div className="h-14 rounded bg-ink/10" />
          <div className="h-2 w-3/4 rounded bg-ink/10" />
          <div className="h-2 w-1/2 rounded bg-ink/10" />
        </>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-2">
          <div className="rounded bg-accent/25" />
          <div className="rounded bg-accent/15" />
          <div className="rounded bg-accent/15" />
          <div className="rounded bg-accent/25" />
        </div>
      )}
    </div>
  );
}
