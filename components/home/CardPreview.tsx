"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  hasWebGL2,
  releaseCanvasSlot,
  tryAcquireCanvasSlot,
} from "@/lib/canvas-live-manager";
import type { Preview } from "@/lib/projects.config";
import { useFinePointer, useReducedMotion } from "@/lib/use-reduced-motion";
import { isSketchName, SketchComponents } from "@/sketches/registry";

type CardPreviewProps = {
  preview?: Preview;
  height?: number;
  cardId: string;
};

export default function CardPreview({
  preview,
  height = 228,
  cardId,
}: CardPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [slotOk, setSlotOk] = useState(false);
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(!!entry?.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const canUseCanvas =
    finePointer &&
    !reducedMotion &&
    hasWebGL2() &&
    preview?.kind === "canvas";

  const wantsLive =
    canUseCanvas && inView && hovered && !hidden && isSketchName(preview.sketch);

  useEffect(() => {
    let cancelled = false;

    if (!wantsLive) {
      releaseCanvasSlot(cardId);
      requestAnimationFrame(() => {
        if (!cancelled) setSlotOk(false);
      });
      return () => {
        cancelled = true;
      };
    }

    const ok = tryAcquireCanvasSlot(cardId);
    requestAnimationFrame(() => {
      if (!cancelled) setSlotOk(ok);
    });

    return () => {
      cancelled = true;
      releaseCanvasSlot(cardId);
    };
  }, [wantsLive, cardId]);

  if (!preview) return null;

  const posterStyle =
    preview.kind === "canvas" || preview.kind === "video"
      ? { backgroundImage: `url(${preview.poster})` }
      : undefined;

  const Sketch =
    preview.kind === "canvas" && isSketchName(preview.sketch)
      ? SketchComponents[preview.sketch]
      : null;

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-hidden rounded-xl bg-surface"
      style={{ height }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {(preview.kind === "canvas" || preview.kind === "video") && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={posterStyle}
          aria-hidden
        />
      )}

      {preview.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          style={{ objectPosition: preview.position ?? "center" }}
        />
      )}

      {preview.kind === "canvas" && Sketch && slotOk && (
        <Sketch
          active
          paused={!inView || hidden || !hovered}
          className="absolute inset-0 h-full w-full"
          interactive={hovered}
        />
      )}

      {preview.kind === "video" && inView && hovered && !hidden && !reducedMotion && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={preview.src}
          poster={preview.poster}
          muted
          loop
          playsInline
          autoPlay
        />
      )}
    </div>
  );
}
