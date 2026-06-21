"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ITEMS = ["Alpha", "Bravo", "Charlie", "Delta"];

/**
 * Simulated list reorder: each item has a unique name, so when the order
 * changes the items animate (FLIP) from their old slot to the new one.
 */
export default function ListReorder({ runToken }: { runToken: number }) {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const listRef = useRef<HTMLUListElement>(null);
  const prevRects = useRef<Map<number, number>>(new Map());

  // On Run: snapshot current item positions, then rotate the order.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rects = new Map<number, number>();
    list.querySelectorAll<HTMLElement>("[data-item]").forEach((el) => {
      rects.set(Number(el.dataset.item), el.getBoundingClientRect().top);
    });
    prevRects.current = rects;
    setOrder((o) => [...o.slice(1), o[0]]); // rotate
  }, [runToken]);

  // After reorder: FLIP each item from its old position to the new one.
  // The initial layout pass has an empty prevRects map, so it animates nothing.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    list.querySelectorAll<HTMLElement>("[data-item]").forEach((el) => {
      const id = Number(el.dataset.item);
      const prevTop = prevRects.current.get(id);
      if (prevTop == null) return;
      const dy = prevTop - el.getBoundingClientRect().top;
      if (dy) {
        gsap.fromTo(
          el,
          { y: dy },
          { y: 0, duration: 0.5, ease: "power2.inOut" },
        );
      }
    });
  }, [order]);

  return (
    <ul ref={listRef} className="flex w-[260px] max-w-full flex-col gap-2">
      {order.map((id, i) => (
        <li
          key={id}
          data-item={id}
          className="flex items-center justify-between rounded-lg border border-border-color bg-elevated px-3 py-2 shadow-sm"
        >
          <span className="font-mono text-[12px] text-ink">{ITEMS[id]}</span>
          <span className="font-mono text-[10px] text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
        </li>
      ))}
    </ul>
  );
}
