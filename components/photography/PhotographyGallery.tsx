"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import { cn } from "@/lib/utils";
import {
  formatFrameCount,
  hiddenPhotoFile,
  photoMeta,
  photos,
  stepPhotoIndex,
  type Photo,
} from "@/lib/photography.config";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type SyntheticEvent,
} from "react";

const PRINT_ROTATIONS = [-3, 2.5, -2, 3, -1.5, 2, -3.5, 1.5, -2.5, 3];
const TAPE_ROTATIONS = [-5, 4, -3, 5, -2, 3, -4, 2, -5, 4];
const DEVELOP_HOLD_MS = 650;
const FLASH_MS = 160;

function photoSource(photo: Photo): string {
  return `/photos/${photo.file}`;
}

function hideMissingImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
  event.currentTarget.alt = "";
}

function GalleryImage({
  photo,
  index,
  available,
}: {
  photo: Photo;
  index: number;
  available: boolean;
}) {
  if (!available) return null;

  return (
    <Image
      className="absolute inset-0 size-full object-cover text-transparent transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover/frame:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
      src={photoSource(photo)}
      alt=""
      width={photo.w}
      height={photo.h}
      sizes="(max-width: 899px) calc((100vw - 50px) / 2), (max-width: 1199px) calc((100vw - 108px) / 3), calc((100vw - 442px) / 4)"
      loading={index < 4 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "auto"}
      decoding="async"
      onError={hideMissingImage}
    />
  );
}

export default function PhotographyGallery({
  availableFiles,
}: {
  availableFiles: readonly string[];
}) {
  const [safelight, setSafelight] = useState(false);
  const [shots, setShots] = useState(38);
  const [flash, setFlash] = useState(false);
  const [hiddenFrameOpen, setHiddenFrameOpen] = useState(false);
  const [developed, setDeveloped] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartedAtRef = useRef<number | null>(null);
  const availableFileSet = useMemo(
    () => new Set(availableFiles),
    [availableFiles],
  );
  const lightboxOpen = activeIndex !== null;
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  const openLightbox = useCallback((index: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

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
        setActiveIndex((current) =>
          current === null ? null : stepPhotoIndex(current, 1),
        );
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) =>
          current === null ? null : stepPhotoIndex(current, -1),
        );
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        lightboxRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLightbox, lightboxOpen]);

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
          "mx-auto flex min-h-screen w-full max-w-360 flex-col gap-8 bg-(--photo-bg) px-16 pt-13 pb-15 [--photo-accent:#c2452f] [--photo-bg:#f6f3ec] [--photo-bulb-off:#c9c1b0] [--photo-button-line:rgba(22,19,15,0.16)] [--photo-dim-2:#6f685b] [--photo-dim:#6f685b] [--photo-frame:#e0d9c9] [--photo-hair-soft:rgba(22,19,15,0.08)] [--photo-hair:rgba(22,19,15,0.14)] [--photo-kicker:#8a8272] [--photo-line:rgba(22,19,15,0.1)] [--photo-meta-2:#a09884] [--photo-meta:#a09884] [--photo-panel:#e9e4d8] [--photo-print-well:#e0d9c9] [--photo-print:#fffdf8] [--photo-reel:#efeade] [--photo-scrim-zero:rgba(246,243,236,0)] [--photo-scrim:rgba(246,243,236,0.95)] [--photo-shadow:0_16px_30px_-18px_rgba(22,19,15,0.5)] [--photo-speck:rgba(22,19,15,0.16)] [--photo-tape:rgba(198,182,140,0.55)] [--photo-text-2:#16130f] [--photo-text:#16130f] [font-family:var(--font-home-jetbrains)] text-(--photo-text) transition-[filter] duration-400 dark:[--photo-accent:#d64030] dark:[--photo-bg:#0d100e] dark:[--photo-bulb-off:#3a403b] dark:[--photo-button-line:rgba(255,255,255,0.12)] dark:[--photo-dim-2:#98a099] dark:[--photo-dim:#767d77] dark:[--photo-frame:#0b0d0c] dark:[--photo-hair-soft:rgba(255,255,255,0.055)] dark:[--photo-hair:rgba(255,255,255,0.1)] dark:[--photo-kicker:#5c625d] dark:[--photo-line:rgba(255,255,255,0.06)] dark:[--photo-meta-2:#3f453f] dark:[--photo-meta:#4e544f] dark:[--photo-panel:#101312] dark:[--photo-print-well:#ddd6c6] dark:[--photo-print:#f7f4ec] dark:[--photo-reel:#0a0c0b] dark:[--photo-scrim-zero:rgba(8,10,9,0)] dark:[--photo-scrim:rgba(8,10,9,0.93)] dark:[--photo-shadow:0_16px_30px_-18px_rgba(0,0,0,0.9)] dark:[--photo-speck:rgba(255,255,255,0.13)] dark:[--photo-tape:rgba(226,214,180,0.5)] dark:[--photo-text-2:#e8ece7] dark:[--photo-text:#f4f6f2] max-[1199px]:px-10 max-[1199px]:pt-11 max-[1199px]:pb-13 max-[899px]:gap-5.5 max-[899px]:px-5 max-[899px]:pt-11 max-[899px]:pb-10 motion-reduce:transition-none",
          safelight &&
            "filter-[sepia(0.75)_hue-rotate(-38deg)_saturate(3.6)_brightness(0.7)]",
        )}
      >
        <header className="flex items-end gap-7.5 max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3.25">
            <div className="flex items-center gap-2.5">
              <span className="text-[9.5px] leading-none font-semibold tracking-[0.18em] text-(--photo-kicker) uppercase">
                04 — PHOTOGRAPHY
              </span>
              <span
                className="h-px w-22.5 bg-(--photo-hair)"
                aria-hidden="true"
              />
            </div>
            <h1 className="m-0 [font-family:var(--font-home-instrument)] text-[52px] leading-[1.04] font-normal tracking-[-0.015em] text-(--photo-text) max-[1199px]:text-[44px] max-[899px]:text-4xl">
              Photographs
            </h1>
            <p className="m-0 max-w-[52ch] text-[12.5px] leading-[1.75] font-normal text-(--photo-dim) max-[899px]:text-[11px] max-[899px]:leading-[1.7]">
              Thirty-eight kept out of six years. The good ones are downstairs
              on the table.
            </p>
          </div>

          <div className="flex flex-none items-center gap-2.5 max-[899px]:justify-start">
            <button
              type="button"
              className="flex min-h-9.5 cursor-pointer items-center gap-2.25 rounded-[30px] border border-(--photo-button-line) bg-transparent px-3.5 py-2.25 text-[9.5px] leading-none font-medium tracking-[0.14em] text-(--photo-dim) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--photo-accent) max-[899px]:min-h-11"
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
              <span className="w-18.25 text-left">
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
              key={photo.no}
              className="relative mb-3.5 block break-inside-avoid overflow-hidden border border-(--photo-line) bg-(--photo-panel) max-[899px]:mb-2.5"
              style={{ aspectRatio: `${photo.w}/${photo.h}` }}
              data-photo-frame={photo.no}
            >
              <button
                type="button"
                className="group/frame absolute inset-0 block size-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-(--photo-accent)"
                aria-label={`${photo.title}. ${photoMeta(photo)}`}
                onClick={(event) =>
                  openLightbox(index, event.currentTarget)
                }
              >
                <GalleryImage
                  photo={photo}
                  index={index}
                  available={availableFileSet.has(photo.file)}
                />
                <span
                  className="absolute right-0 bottom-0 left-0 flex translate-y-1.75 flex-col gap-1 bg-[linear-gradient(180deg,var(--photo-scrim-zero),var(--photo-scrim)_58%)] px-3.75 pt-3.5 pb-3 opacity-0 transition-[opacity,transform] duration-240 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover/frame:translate-y-0 group-hover/frame:opacity-100 group-focus-visible/frame:translate-y-0 group-focus-visible/frame:opacity-100 max-[899px]:translate-y-0 max-[899px]:px-2.5 max-[899px]:pt-4.5 max-[899px]:pb-2 max-[899px]:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <b className="[font-family:var(--font-home-instrument)] text-[15px] leading-[1.2] font-normal text-(--photo-text) max-[899px]:text-[12.5px]">
                    {photo.title}
                  </b>
                  <small className="text-[9.5px] leading-normal font-normal text-(--photo-dim-2) max-[899px]:hidden">
                    {photoMeta(photo)}
                  </small>
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
              className="text-[9.5px] leading-none font-semibold tracking-[0.18em] text-(--photo-kicker) uppercase"
              id="reel-heading"
            >
              ON THE TABLE
            </span>
            <span className="[font-family:var(--font-photography-caveat)] text-[15px] leading-none font-normal text-(--photo-kicker) max-[899px]:hidden">
              the ones I keep coming back to
            </span>
            <span
              className="h-px flex-1 bg-(--photo-hair-soft)"
              aria-hidden="true"
            />
            <span className="text-[9.5px] leading-none font-normal tracking-[0.14em] text-(--photo-meta-2) uppercase">
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
                key={photo.no}
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
                  aria-label={`Open ${photo.title}`}
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
                  <span className="relative block aspect-square overflow-hidden bg-(--photo-print-well)">
                    {availableFileSet.has(photo.file) && (
                      <Image
                        className="absolute inset-0 size-full object-cover text-transparent"
                        src={photoSource(photo)}
                        alt=""
                        width={photo.w}
                        height={photo.h}
                        sizes="156px"
                        loading="lazy"
                        decoding="async"
                        onError={hideMissingImage}
                      />
                    )}
                  </span>
                  <span className="flex items-baseline gap-1.5 px-0.5 pt-2 pb-2.75">
                    <b className="[font-family:var(--font-photography-caveat)] text-sm leading-none font-normal text-[#16130f]">
                      {photo.title}
                    </b>
                    <small className="ml-auto text-[8px] leading-none font-normal text-[#a09884]">
                      {photo.year}
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
            className="text-[9.5px] leading-none font-normal tracking-[0.14em] text-(--photo-meta-2) uppercase"
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
            {availableFileSet.has(hiddenPhotoFile) && (
              <Image
                className="absolute inset-0 size-full object-cover text-transparent filter-[brightness(0.25)_contrast(0.4)_blur(4px)] transition-[filter] duration-1600 group-data-[developed=true]/develop:filter-none motion-reduce:transition-none"
                src={`/photos/${hiddenPhotoFile}`}
                alt=""
                width={3000}
                height={2000}
                sizes="168px"
                loading="lazy"
                decoding="async"
                onError={hideMissingImage}
              />
            )}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-(--photo-frame) text-[10px] leading-none font-normal tracking-[0.12em] text-(--photo-meta) opacity-92 transition-opacity duration-1600 group-data-[developed=true]/develop:opacity-0 motion-reduce:transition-none"
              aria-hidden="true"
            >
              HOLD
            </span>
          </button>
          <div className="flex flex-col gap-1.75">
            <h2 className="m-0 [font-family:var(--font-home-instrument)] text-[21px] leading-[1.1] font-normal text-(--photo-text-2)">
              The one that nearly wasn&apos;t
            </h2>
            <p className="m-0 max-w-[46ch] text-[11px] leading-[1.65] font-normal text-(--photo-dim)">
              Three stops under, pulled back in the scan. Press and hold to
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
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-90 flex cursor-zoom-out items-center justify-center bg-[rgba(246,243,236,0.975)] px-15 py-11 backdrop-blur-[6px] focus:outline-none dark:bg-[rgba(6,8,7,0.965)] max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:justify-center max-[899px]:p-5.5"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          tabIndex={-1}
          onClick={closeLightbox}
        >
          <div className="flex w-full max-w-225 flex-col gap-4">
            <div className="relative h-[min(620px,72vh)] border border-[rgba(22,19,15,0.1)] bg-[#e9e4d8] dark:border-white/6 dark:bg-[#101312] max-[899px]:h-[min(420px,52vh)]">
              {availableFileSet.has(activePhoto.file) && (
                <Image
                  key={activePhoto.file}
                  className="absolute inset-0 size-full object-contain text-transparent"
                  src={photoSource(activePhoto)}
                  alt=""
                  width={activePhoto.w}
                  height={activePhoto.h}
                  sizes="min(900px, 90vw)"
                  loading="eager"
                  decoding="async"
                  onError={hideMissingImage}
                />
              )}
            </div>
            <div className="flex items-end gap-7.5 max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-1.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.25 [font-family:var(--font-home-instrument)] text-2xl leading-[1.1] font-normal text-[#16130f] dark:text-[#f4f6f2]">
                <span className="[font-family:var(--font-home-jetbrains)] text-[9px] leading-none font-semibold tracking-[0.16em] text-[#c2452f] dark:text-[#d64030]">
                  {activePhoto.no}
                </span>
                <span>{activePhoto.title}</span>
              </div>
              <span className="[font-family:var(--font-home-jetbrains)] text-right text-[10.5px] leading-[1.7] font-normal text-[#6f685b] dark:text-[#98a099] max-[899px]:text-left">
                {photoMeta(activePhoto)}
              </span>
              <span
                className="[font-family:var(--font-home-jetbrains)] text-[9.5px] leading-none font-normal tracking-widest text-[#a09884] dark:text-[#4e544f]"
                aria-hidden="true"
              >
                <span className="max-[899px]:hidden">← → ESC</span>
                <span className="hidden max-[899px]:inline">
                  TAP ANYWHERE TO CLOSE
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
