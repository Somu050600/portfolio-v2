type FocusFrameProps = {
  ctaActive: boolean;
  lockedLine: number | null;
};

/** [corner, edge borders + placement] */
const corners = [
  ["tl", "top-0 left-0 border-t border-l"],
  ["tr", "top-0 right-0 border-t border-r"],
  ["bl", "bottom-0 left-0 border-b border-l"],
  ["br", "right-0 bottom-0 border-r border-b"],
] as const;

export default function FocusFrame({ ctaActive, lockedLine }: FocusFrameProps) {
  return (
    <div
      aria-hidden="true"
      className="group pointer-events-none absolute z-5 inset-[24%_9%_23%] max-lg:inset-[23%_7%_22%] max-md:inset-[22%_5.5%_21%]"
      data-cta-active={ctaActive ? "" : undefined}
      data-locked={lockedLine ? "" : undefined}
    >
      {/* Drifts with the spotlight (--frame-x/y), squeezes toward the CTA, and
          flattens into a bar when a headline line is locked. */}
      <div
        className="absolute inset-0 origin-center translate-x-(--frame-x) translate-y-(--frame-y) transition-transform duration-320 ease-(--ease-out-soft) will-change-transform group-data-cta-active:scale-x-[0.94] group-data-cta-active:scale-y-90 group-data-locked:translate-y-[calc(var(--frame-y)+var(--frame-lock-y))] group-data-locked:scale-x-[0.76] group-data-locked:scale-y-[0.32] max-md:group-data-locked:scale-x-[0.86] max-md:group-data-locked:scale-y-[0.36]"
      >
        {corners.map(([corner, placement]) => (
          <span
            key={corner}
            className={`absolute size-6 border-(--landing-line) max-md:size-4.5 ${placement}`}
          />
        ))}
      </div>
    </div>
  );
}
