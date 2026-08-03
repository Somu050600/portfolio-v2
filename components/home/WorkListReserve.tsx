"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { getWorkListReserveHeight } from "./work-card-layout";

export default function WorkListReserve({ children }: { children: ReactNode }) {
  const reserveRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reserve = reserveRef.current;
    const content = contentRef.current;
    if (!reserve || !content) return;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const height = getWorkListReserveHeight(
          content.getBoundingClientRect().height,
          reserve.getBoundingClientRect().width,
        );
        reserve.style.height = height === null ? "auto" : `${height}px`;
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(reserve);
    measure();
    void document.fonts.ready.then(measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={reserveRef}
      data-work-list-reserve
      className="@max-[640px]:pb-25"
    >
      <div ref={contentRef} data-work-list-content>
        {children}
      </div>
    </div>
  );
}
