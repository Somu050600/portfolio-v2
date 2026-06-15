"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Thumbnail as ThumbnailData } from "@/lib/thumbnail";
import { componentAttrs } from "@/lib/build-mode";
import { useFinePointer, useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { registry } from "./registry";
import { claimSlot, releaseSlot } from "./slots";

type ThumbnailProps = {
  thumbnail: ThumbnailData;
  className?: string;
};

const DEFAULT_HEIGHT = 228;

export default function Thumbnail({ thumbnail, className }: ThumbnailProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [slotOk, setSlotOk] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const reactId = useId();
  const slotId = `thumb-${reactId}`;

  const height =
    (typeof thumbnail.params?.height === "number"
      ? thumbnail.params.height
      : undefined) ?? DEFAULT_HEIGHT;
  const objectPosition =
    (typeof thumbnail.params?.objectPosition === "string"
      ? thumbnail.params.objectPosition
      : undefined) ?? "center";
  const videoSrc =
    typeof thumbnail.params?.src === "string" ? thumbnail.params.src : undefined;

  const motionOK = !reducedMotion;
  const baseActive = motionOK && finePointer && inView && hovered && !hidden;

  const Treatment = registry[thumbnail.kind];
  const hasTreatment = !!Treatment;

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

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box) return;
      setSize({ width: Math.round(box.width), height: Math.round(box.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!baseActive || !hasTreatment) {
      releaseSlot(slotId);
      const id = requestAnimationFrame(() => {
        if (!cancelled) setSlotOk(false);
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(id);
        releaseSlot(slotId);
      };
    }

    const ok = claimSlot(slotId);
    const id = requestAnimationFrame(() => {
      if (!cancelled) setSlotOk(ok);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      releaseSlot(slotId);
    };
  }, [baseActive, hasTreatment, slotId]);

  const treatmentActive = baseActive && hasTreatment && slotOk;
  const videoActive = baseActive && thumbnail.kind === "video" && !!videoSrc;

  const frameStyle: CSSProperties = { height };

  const posterNote =
    thumbnail.kind === "image"
      ? "Static image — poster layer only."
      : thumbnail.kind === "video"
        ? "Poster by default; native video on hover when in view."
        : hasTreatment
          ? `Poster fallback; ${thumbnail.kind} treatment mounts on hover (≤3 global).`
          : "Poster only — treatment not registered yet.";

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-surface",
        className,
      )}
      style={frameStyle}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      {...componentAttrs("Thumbnail", posterNote)}
    >
      {thumbnail.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail.poster}
          alt={thumbnail.alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            thumbnail.kind === "image" &&
              "transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
          )}
          style={{ objectPosition }}
        />
      )}

      {treatmentActive && Treatment && size.width > 0 && (
        <Treatment
          active={treatmentActive}
          width={size.width}
          height={size.height}
          accent={thumbnail.accent}
          poster={thumbnail.poster}
          params={thumbnail.params}
        />
      )}

      {videoActive && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={thumbnail.poster}
          muted
          loop
          playsInline
          autoPlay
        />
      )}
    </div>
  );
}
