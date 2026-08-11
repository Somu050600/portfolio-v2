"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import { cn } from "@/lib/utils";
import { typeStyles } from "@/lib/typography";
import {
  formatFrameCount,
  hiddenPhotoId,
  photoLabel,
  photoMeta,
  photos,
  stepPhotoIndex,
  type Photo,
} from "@/lib/photography.config";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type SyntheticEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { flushSync } from "react-dom";

const PanoramaViewer = dynamic(() => import("./PanoramaViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10 font-mono text-metadata tracking-widest text-white uppercase">
      Loading 360°
    </div>
  ),
});

const SWIPE_MIN_DISTANCE_PX = 56;
/** Horizontal travel must beat vertical by this much to count as a swipe. */
const SWIPE_DIRECTION_RATIO = 1.4;
const PRINT_ROTATIONS = [-3, 2.5, -2, 3, -1.5, 2, -3.5, 1.5, -2.5, 3];
const TAPE_ROTATIONS = [-5, 4, -3, 5, -2, 3, -4, 2, -5, 4];
const DEVELOP_HOLD_MS = 650;
const FLASH_MS = 160;
const ACTIVE_PHOTO_TRANSITION_NAME = "photo-active";

function hideMissingImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
  event.currentTarget.alt = "";
}

function GalleryImage({
  photo,
  index,
  transitionName,
}: {
  photo: Photo;
  index: number;
  transitionName?: string;
}) {
  return (
    <NextImage
      className="absolute inset-0 size-full object-cover text-transparent transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover/frame:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
      src={photo.gridSrc}
      alt=""
      width={photo.width}
      height={photo.height}
      sizes="(max-width: 899px) calc((100vw - 50px) / 2), (max-width: 1199px) calc((100vw - 108px) / 3), calc((100vw - 442px) / 4)"
      loading={index === 0 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "auto"}
      decoding="async"
      placeholder={photo.blurDataURL ? "blur" : "empty"}
      blurDataURL={photo.blurDataURL}
      style={{
        viewTransitionName: transitionName,
      }}
      onError={hideMissingImage}
    />
  );
}

export default function PhotographyGallery() {
  const [safelight, setSafelight] = useState(false);
  const [shots, setShots] = useState<number>(photos.length);
  const [flash, setFlash] = useState(false);
  const [hiddenFrameOpen, setHiddenFrameOpen] = useState(false);
  const [developed, setDeveloped] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [transitionPhotoId, setTransitionPhotoId] = useState<string | null>(
    null,
  );
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartedAtRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeConsumedRef = useRef(false);
  const prefetchGenerationRef = useRef(0);
  const transitionGenerationRef = useRef(0);
  const lightboxOpen = activeIndex !== null;
  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const hiddenPhoto = photos.find(({ id }) => id === hiddenPhotoId);

  const runPhotoTransition = useCallback(
    (photoId: string, update: () => void) => {
      if (!document.startViewTransition || reducedMotion) {
        update();
        return;
      }

      const generation = ++transitionGenerationRef.current;
      flushSync(() => setTransitionPhotoId(photoId));

      const transition = document.startViewTransition(() => {
        flushSync(update);
      });

      void transition.finished.finally(() => {
        if (generation !== transitionGenerationRef.current) return;
        setTransitionPhotoId(null);
      });
    },
    [reducedMotion],
  );

  const openLightbox = useCallback(
    (index: number, opener: HTMLElement) => {
      openerRef.current = opener;
      performance.mark("photo-viewer-click");
      runPhotoTransition(photos[index].id, () => setActiveIndex(index));
    },
    [runPhotoTransition],
  );

  const stepActive = useCallback((delta: number) => {
    performance.mark("photo-viewer-click");
    setActiveIndex((current) =>
      current === null ? null : stepPhotoIndex(current, delta),
    );
  }, []);

  const closeLightbox = useCallback(() => {
    prefetchGenerationRef.current += 1;
    if (!activePhoto) return;
    runPhotoTransition(activePhoto.id, () => setActiveIndex(null));
  }, [activePhoto, runPhotoTransition]);

  const prefetchAdjacent = useCallback((index: number) => {
    const generation = ++prefetchGenerationRef.current;
    const adjacentSources = [-1, 1]
      .map((delta) => photos[stepPhotoIndex(index, delta)].viewerSrc)
      .filter((source): source is string => Boolean(source));
    performance.mark("photo-adjacent-prefetch-start");
    void Promise.all(
      adjacentSources.map(
        (source) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = source;
          }),
      ),
    ).then(() => {
      if (generation !== prefetchGenerationRef.current) return;
      performance.mark("photo-adjacent-prefetch-ready");
      performance.measure(
        "photo-adjacent-prefetch-duration",
        "photo-adjacent-prefetch-start",
        "photo-adjacent-prefetch-ready",
      );
    });
  }, []);

  const onViewerLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const index = activeIndex;
      if (index === null) return;
      void event.currentTarget.decode().catch(() => undefined).then(() => {
        if (activeIndex !== index) return;
        performance.mark("photo-viewer-decoded");
        performance.measure(
          "photo-viewer-click-to-decoded",
          "photo-viewer-click",
          "photo-viewer-decoded",
        );
        prefetchAdjacent(index);
      });
    },
    [activeIndex, prefetchAdjacent],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    const dialog = lightboxRef.current;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => dialog?.focus());

    const keepFocusInside = (event: FocusEvent) => {
      if (dialog && !dialog.contains(event.target as Node)) dialog.focus();
    };

    document.addEventListener("focusin", keepFocusInside);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("focusin", keepFocusInside);
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => openerRef.current?.focus());
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepActive(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepActive(-1);
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        lightboxRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, lightboxOpen, stepActive]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    },
    [],
  );

  const fireShutter = () => {
    setShots((current) => current + 1);
    setFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(false), FLASH_MS);
  };

  const beginDevelop = () => {
    if (developed || holdStartedAtRef.current !== null) return;
    holdStartedAtRef.current = performance.now();
    if (!reducedMotion) {
      holdTimerRef.current = setTimeout(
        () => setDeveloped(true),
        DEVELOP_HOLD_MS,
      );
    }
  };

  const endDevelop = () => {
    if (holdStartedAtRef.current === null) return;
    const heldFor = performance.now() - holdStartedAtRef.current;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    holdStartedAtRef.current = null;
    if (reducedMotion && heldFor >= DEVELOP_HOLD_MS) setDeveloped(true);
  };

  const onDevelopKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
      event.preventDefault();
      beginDevelop();
    }
  };

  const onLightboxTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    swipeConsumedRef.current = false;
    // Inside the panorama every finger belongs to the camera, not the gallery.
    if ((event.target as HTMLElement).closest("[data-panorama]")) {
      swipeStartRef.current = null;
      return;
    }
    if (event.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    const touch = event.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onLightboxTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (
      Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX ||
      Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DIRECTION_RATIO
    ) {
      return;
    }
    // Swiping left pulls the next frame in from the right.
    swipeConsumedRef.current = true;
    stepActive(deltaX < 0 ? 1 : -1);
  };

  const onLightboxClick = () => {
    if (swipeConsumedRef.current) {
      swipeConsumedRef.current = false;
      return;
    }
    closeLightbox();
  };

  const onDevelopKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      endDevelop();
    }
  };

  return (
    <>
      <main
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-360 flex-col gap-8 bg-(--photo-bg) px-16 pt-13 pb-15 font-body [--photo-accent:#c2452f] [--photo-bg:#f6f3ec] [--photo-bulb-off:#c9c1b0] [--photo-button-line:rgba(22,19,15,0.16)] [--photo-dim-2:#6f685b] [--photo-dim:#6f685b] [--photo-frame:#e0d9c9] [--photo-hair-soft:rgba(22,19,15,0.08)] [--photo-hair:rgba(22,19,15,0.14)] [--photo-kicker:#8a8272] [--photo-line:rgba(22,19,15,0.1)] [--photo-meta-2:#a09884] [--photo-meta:#a09884] [--photo-panel:#e9e4d8] [--photo-print-well:#e0d9c9] [--photo-print:#fffdf8] [--photo-reel:#efeade] [--photo-scrim-zero:rgba(246,243,236,0)] [--photo-scrim:rgba(246,243,236,0.95)] [--photo-shadow:0_16px_30px_-18px_rgba(22,19,15,0.5)] [--photo-speck:rgba(22,19,15,0.16)] [--photo-tape:rgba(198,182,140,0.55)] [--photo-text-2:#16130f] [--photo-text:#16130f] text-(--photo-text) transition-[filter] duration-400 dark:[--photo-accent:#d64030] dark:[--photo-bg:#0d100e] dark:[--photo-bulb-off:#3a403b] dark:[--photo-button-line:rgba(255,255,255,0.12)] dark:[--photo-dim-2:#98a099] dark:[--photo-dim:#767d77] dark:[--photo-frame:#0b0d0c] dark:[--photo-hair-soft:rgba(255,255,255,0.055)] dark:[--photo-hair:rgba(255,255,255,0.1)] dark:[--photo-kicker:#5c625d] dark:[--photo-line:rgba(255,255,255,0.06)] dark:[--photo-meta-2:#3f453f] dark:[--photo-meta:#4e544f] dark:[--photo-panel:#101312] dark:[--photo-print-well:#ddd6c6] dark:[--photo-print:#f7f4ec] dark:[--photo-reel:#0a0c0b] dark:[--photo-scrim-zero:rgba(8,10,9,0)] dark:[--photo-scrim:rgba(8,10,9,0.93)] dark:[--photo-shadow:0_16px_30px_-18px_rgba(0,0,0,0.9)] dark:[--photo-speck:rgba(255,255,255,0.13)] dark:[--photo-tape:rgba(226,214,180,0.5)] dark:[--photo-text-2:#e8ece7] dark:[--photo-text:#f4f6f2] max-[1199px]:px-10 max-[1199px]:pt-11 max-[1199px]:pb-13 max-[899px]:gap-5.5 max-[899px]:px-5 max-[899px]:pt-11 max-[899px]:pb-10 motion-reduce:transition-none",
          safelight &&
            "filter-[sepia(0.75)_hue-rotate(-38deg)_saturate(3.6)_brightness(0.7)]",
        )}
      >
        <header className="flex items-end gap-7.5 max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3.25">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-metadata leading-none font-semibold tracking-[0.18em] text-(--photo-kicker) uppercase">
                04 · PHOTOGRAPHY
              </span>
              <span
                className="h-px w-22.5 bg-(--photo-hair)"
                aria-hidden="true"
              />
            </div>
            <h1 className={`${typeStyles.pageTitle} m-0 text-(--photo-text)`}>
              Photographs
            </h1>
            <p className={`${typeStyles.bodySmall} m-0 max-w-[52ch] text-(--photo-dim)`}>
              Twenty selected photographs, developed for the web without
              touching the originals.
            </p>
          </div>

          <div className="flex flex-none items-center gap-2.5 max-[899px]:justify-start">
            <Link
              href="/home/work/photography-pipeline"
              className="mr-1 font-mono text-metadata leading-none font-medium tracking-[0.12em] text-(--photo-dim) uppercase underline decoration-(--photo-hair) underline-offset-4 transition-colors hover:text-(--photo-text) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent)"
            >
              How it was built ↗
            </Link>
            <button
              type="button"
              className="flex min-h-9.5 cursor-pointer items-center gap-2.25 rounded-[30px] border border-(--photo-button-line) bg-transparent px-3.5 py-2.25 font-mono text-metadata leading-none font-medium tracking-[0.14em] text-(--photo-dim) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent) max-[899px]:min-h-11"
              aria-label="Toggle safelight"
              aria-pressed={safelight}
              onClick={() => setSafelight((current) => !current)}
            >
              <span
                className={cn(
                  "size-2.25 rounded-full bg-(--photo-bulb-off) transition-[background,box-shadow] duration-240 motion-reduce:transition-none",
                  safelight &&
                    "bg-(--photo-accent) [box-shadow:0_0_14px_3px_rgba(214,64,48,0.55)]",
                )}
                aria-hidden="true"
              />
              <span className="w-18.25 whitespace-nowrap text-left">
                {safelight ? "SAFELIGHT ON" : "SAFELIGHT"}
              </span>
            </button>
            <button
              type="button"
              className="flex size-9.5 cursor-pointer items-center justify-center rounded-full border border-(--photo-accent) bg-transparent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent) max-[899px]:size-11 max-[899px]:min-h-11"
              aria-label="Fire the shutter"
              onClick={fireShutter}
            >
              <span
                className="size-3.25 rounded-full bg-(--photo-accent) opacity-90"
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        <section
          className="columns-4 gap-3.5 max-[1199px]:columns-3 max-[899px]:columns-2 max-[899px]:gap-2.5"
          aria-label="Photographs"
        >
          {photos.map((photo, index) => (
            <figure
              key={photo.id}
              className="relative mb-3.5 block break-inside-avoid overflow-hidden border border-(--photo-line) bg-(--photo-panel) max-[899px]:mb-2.5"
              style={{
                aspectRatio: `${photo.width}/${photo.height}`,
                backgroundColor: photo.dominantColor,
              }}
              data-photo-frame={photo.no}
            >
              <button
                type="button"
                className="group/frame absolute inset-0 block size-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-(--photo-accent)"
                aria-label={[photoLabel(photo), photo.alt, photoMeta(photo)]
                  .filter(Boolean)
                  .join(". ")}
                onClick={(event) =>
                  openLightbox(index, event.currentTarget)
                }
              >
                <GalleryImage
                  photo={photo}
                  index={index}
                  transitionName={
                    activeIndex === null && transitionPhotoId === photo.id
                      ? ACTIVE_PHOTO_TRANSITION_NAME
                      : undefined
                  }
                />
                <span
                  className="absolute right-0 bottom-0 left-0 flex translate-y-1.75 flex-col gap-1 bg-[linear-gradient(180deg,var(--photo-scrim-zero),var(--photo-scrim)_58%)] px-3.75 pt-3.5 pb-3 opacity-0 transition-[opacity,transform] duration-240 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover/frame:translate-y-0 group-hover/frame:opacity-100 group-focus-visible/frame:translate-y-0 group-focus-visible/frame:opacity-100 max-[899px]:translate-y-0 max-[899px]:px-2.5 max-[899px]:pt-4.5 max-[899px]:pb-2 max-[899px]:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <b className="font-display text-[15px] leading-[1.2] font-medium text-(--photo-text) max-[899px]:text-[12.5px]">
                    {photoLabel(photo)}
                  </b>
                  {photoMeta(photo) && (
                    <small className="font-mono text-metadata leading-normal font-normal text-(--photo-dim-2) max-[899px]:hidden">
                      {photoMeta(photo)}
                    </small>
                  )}
                </span>
              </button>
            </figure>
          ))}
        </section>

        <section
          className="flex flex-col gap-3.5"
          aria-labelledby="reel-heading"
        >
          <div className="flex items-baseline gap-3">
            <span
              className="font-mono text-metadata leading-none font-semibold tracking-[0.18em] text-(--photo-kicker) uppercase"
              id="reel-heading"
            >
              ON THE TABLE
            </span>
            <span className="font-accent-hand text-[15px] leading-none font-normal text-(--photo-kicker) max-[899px]:hidden">
              the ones I keep coming back to
            </span>
            <span
              className="h-px flex-1 bg-(--photo-hair-soft)"
              aria-hidden="true"
            />
            <span className="font-mono text-metadata leading-none font-normal tracking-[0.14em] text-(--photo-meta-2) uppercase">
              <span className="max-[899px]:hidden">SCROLL →</span>
              <span className="hidden max-[899px]:inline">SWIPE →</span>
            </span>
          </div>

          <div
            className="flex gap-5 overflow-x-auto rounded-lg border border-(--photo-line) bg-(--photo-reel) px-1 pt-5 pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-(--photo-hair) max-[899px]:-mx-5 max-[899px]:snap-x max-[899px]:snap-mandatory max-[899px]:gap-3.5 max-[899px]:rounded-none max-[899px]:border-x-0 max-[899px]:px-3 max-[899px]:py-4"
            data-lenis-prevent
          >
            {photos.slice(0, 10).map((photo, index) => (
              <figure
                key={photo.id}
                className="relative m-0 w-39 flex-none transform-[rotate(var(--print-rotation))] transition-transform duration-220 ease-[cubic-bezier(0.2,0.8,0.3,1)] hover:z-6 hover:transform-[rotate(0deg)_scale(1.04)] max-[899px]:w-33 max-[899px]:snap-center motion-reduce:transform-none motion-reduce:transition-none"
                style={
                  {
                    "--print-rotation": `${PRINT_ROTATIONS[index]}deg`,
                  } as CSSProperties
                }
                data-photo-print={photo.no}
              >
                <button
                  type="button"
                  className="relative block w-full cursor-pointer rounded-xs border-0 bg-(--photo-print) px-2.25 pt-2.25 pb-0 text-left [box-shadow:var(--photo-shadow)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent)"
                  aria-label={`Open ${photoLabel(photo)}`}
                  onClick={(event) =>
                    openLightbox(index, event.currentTarget)
                  }
                >
                  <span
                    className="pointer-events-none absolute -top-2.25 left-1/2 z-1 -ml-6.25 h-4.25 w-12.5 bg-(--photo-tape) transform-[rotate(var(--tape-rotation))] max-[899px]:hidden"
                    style={
                      {
                        "--tape-rotation": `${TAPE_ROTATIONS[index]}deg`,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                  <span
                    className="relative block aspect-square overflow-hidden bg-(--photo-print-well)"
                    style={{ backgroundColor: photo.dominantColor }}
                  >
                    <NextImage
                      className="absolute inset-0 size-full object-cover text-transparent"
                      src={photo.thumbSrc}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      sizes="156px"
                      loading="lazy"
                      decoding="async"
                      onError={hideMissingImage}
                    />
                  </span>
                  <span className="flex items-baseline gap-1.5 px-0.5 pt-2 pb-2.75">
                    <b className="font-accent-hand text-sm leading-none font-normal text-[#16130f]">
                      {photoLabel(photo)}
                    </b>
                    <small className="ml-auto font-mono text-[8px] leading-none font-normal text-[#a09884]">
                      {photo.capturedAt?.slice(0, 4) ?? "·"}
                    </small>
                  </span>
                </button>
              </figure>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-1.5 text-[13px] leading-none font-normal text-(--photo-speck) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent)"
            aria-label="A speck of dust"
            aria-expanded={hiddenFrameOpen}
            onClick={() => setHiddenFrameOpen((current) => !current)}
          >
            ✦
          </button>
          <span
            className="h-px flex-1 bg-(--photo-hair-soft)"
            aria-hidden="true"
          />
          <span
            className="font-mono text-metadata leading-none font-normal tracking-[0.14em] text-(--photo-meta-2) uppercase"
            aria-live="polite"
          >
            <span className="max-[899px]:hidden">
              {formatFrameCount(shots, false)}
            </span>
            <span className="hidden max-[899px]:inline">
              {formatFrameCount(shots, true)}
            </span>
          </span>
        </div>

        <section
          className={cn(
            "flex items-center gap-4.5 rounded-lg border border-dashed border-[rgba(214,64,48,0.35)] px-4.5 py-4 max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-3",
            !hiddenFrameOpen && "hidden",
          )}
          hidden={!hiddenFrameOpen}
          aria-label="The one that nearly wasn't"
        >
          <button
            type="button"
            className="group/develop relative aspect-3/2 w-42 flex-none cursor-pointer overflow-hidden border border-(--photo-line) bg-(--photo-frame) p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent) max-[899px]:w-full"
            data-developed={developed}
            aria-label="Press and hold to develop the hidden photograph"
            onPointerDown={beginDevelop}
            onPointerUp={endDevelop}
            onPointerCancel={endDevelop}
            onPointerLeave={endDevelop}
            onKeyDown={onDevelopKeyDown}
            onKeyUp={onDevelopKeyUp}
          >
            {hiddenPhoto && (
              <NextImage
                className="absolute inset-0 size-full object-cover text-transparent filter-[brightness(0.25)_contrast(0.4)_blur(4px)] transition-[filter] duration-1600 group-data-[developed=true]/develop:filter-none motion-reduce:transition-none"
                src={hiddenPhoto.gridSrc}
                alt=""
                width={hiddenPhoto.width}
                height={hiddenPhoto.height}
                sizes="168px"
                loading="lazy"
                decoding="async"
                onError={hideMissingImage}
              />
            )}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-(--photo-frame) font-mono text-metadata leading-none font-normal tracking-[0.12em] text-(--photo-meta) opacity-92 transition-opacity duration-1600 group-data-[developed=true]/develop:opacity-0 motion-reduce:transition-none"
              aria-hidden="true"
            >
              HOLD
            </span>
          </button>
          <div className="flex flex-col gap-1.75">
            <h2 className={`${typeStyles.cardTitle} m-0 text-(--photo-text-2)`}>
              The one that nearly wasn&apos;t
            </h2>
            <p className={`${typeStyles.bodySmall} m-0 max-w-[46ch] text-(--photo-dim)`}>
              A final frame from the same processed set. Press and hold to
              develop it.
            </p>
          </div>
        </section>
      </main>

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-80 bg-white opacity-0 transition-opacity duration-160 motion-reduce:transition-none",
          flash && "opacity-92",
        )}
        aria-hidden="true"
      />

      {activePhoto && (
        // Click-to-close is the backdrop gesture; the keyboard path is Escape
        // plus arrow keys, bound on window while the dialog is open (see the
        // effect above), which the rule cannot see from the JSX.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-90 flex cursor-zoom-out items-center justify-center bg-[rgba(246,243,236,0.975)] px-15 py-11 backdrop-blur-[6px] focus:outline-none dark:bg-[rgba(6,8,7,0.965)] max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:justify-center max-[899px]:p-5.5"
          role="dialog"
          aria-modal="true"
          aria-label={photoLabel(activePhoto)}
          tabIndex={-1}
          onClick={onLightboxClick}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
        >
          <div className="flex w-full max-w-225 flex-col gap-4">
            <div
              className="relative h-[min(620px,72vh)] overflow-hidden border border-[rgba(22,19,15,0.1)] bg-[#e9e4d8] dark:border-white/6 dark:bg-[#101312] max-[899px]:h-[min(420px,52vh)]"
              style={{ backgroundColor: activePhoto.dominantColor }}
            >
              {activePhoto.type === "panorama360" &&
              activePhoto.panoramaSrc &&
              activePhoto.posterSrc ? (
                <PanoramaViewer
                  key={activePhoto.id}
                  src={activePhoto.panoramaSrc}
                  posterSrc={activePhoto.posterSrc}
                  alt={activePhoto.alt}
                  transitionName={
                    transitionPhotoId === activePhoto.id
                      ? ACTIVE_PHOTO_TRANSITION_NAME
                      : undefined
                  }
                  onInteractive={() => {
                    if (activeIndex !== null) prefetchAdjacent(activeIndex);
                  }}
                />
              ) : (
                activePhoto.viewerSrc && (
                  <NextImage
                    key={activePhoto.id}
                    className="absolute inset-0 size-full object-contain text-transparent"
                    src={activePhoto.viewerSrc}
                    alt={activePhoto.alt}
                    width={activePhoto.width}
                    height={activePhoto.height}
                    sizes="(max-width: 899px) calc(100vw - 44px), min(900px, 90vw)"
                    loading="eager"
                    decoding="async"
                    placeholder={activePhoto.blurDataURL ? "blur" : "empty"}
                    blurDataURL={activePhoto.blurDataURL}
                    style={{
                      viewTransitionName:
                        transitionPhotoId === activePhoto.id
                          ? ACTIVE_PHOTO_TRANSITION_NAME
                          : undefined,
                    }}
                    onLoad={onViewerLoad}
                    onError={hideMissingImage}
                  />
                )
              )}
            </div>
            <div className="flex items-end gap-7.5 max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-1.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.25 font-display text-2xl leading-[1.1] font-medium text-[#16130f] dark:text-[#f4f6f2]">
                <span className="font-mono text-metadata leading-none font-semibold tracking-[0.16em] text-[#c2452f] dark:text-[#d64030]">
                  {activePhoto.no}
                </span>
                <span>{photoLabel(activePhoto)}</span>
              </div>
              {photoMeta(activePhoto) && (
                <span className="font-mono text-metadata text-right leading-[1.7] font-normal text-[#6f685b] dark:text-[#98a099] max-[899px]:text-left">
                  {photoMeta(activePhoto)}
                </span>
              )}
              <span
                className="font-mono text-metadata leading-none font-normal tracking-widest text-[#a09884] dark:text-[#4e544f]"
                aria-hidden="true"
              >
                <span className="max-[899px]:hidden">← → ESC</span>
                <span className="hidden max-[899px]:inline">
                  SWIPE ← → · TAP TO CLOSE
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
