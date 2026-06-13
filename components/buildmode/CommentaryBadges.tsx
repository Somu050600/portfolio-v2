"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type Badge = {
  id: string;
  note: string;
  top: number;
  left: number;
};

export default function CommentaryBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const measure = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-note]");
      const next: Badge[] = [];
      nodes.forEach((el, i) => {
        const note = el.dataset.note;
        if (!note) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        next.push({
          id: `${el.dataset.component ?? "node"}-${i}`,
          note,
          top: rect.top + 4,
          left: rect.right - 20,
        });
      });
      setBadges(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9989]">
      {badges.map((b) => (
        <div
          key={b.id}
          className="pointer-events-auto absolute"
          style={{ top: b.top, left: b.left }}
        >
          <button
            type="button"
            aria-label="Show build note"
            aria-expanded={openId === b.id}
            onClick={() => setOpenId((cur) => (cur === b.id ? null : b.id))}
            className="flex size-5 items-center justify-center rounded-full border border-border-color bg-elevated text-[11px] text-ink-dim shadow-sm hover:text-ink"
          >
            ⓘ
          </button>
          {openId === b.id && (
            <p
              role="tooltip"
              className="absolute top-6 right-0 w-48 rounded-lg border border-border-color bg-elevated p-2 text-xs leading-snug text-ink-dim shadow-lg"
            >
              {b.note}
            </p>
          )}
        </div>
      ))}
    </div>,
    document.body,
  );
}
