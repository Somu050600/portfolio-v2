"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { CurrentPixelRenderer } from "./PixelCharacter";
import {
  PIXEL_CHARACTERS,
  getNextCharacterMenuIndex,
  type PixelCharacterId,
} from "./pixel-characters";

type CharacterPickerProps = {
  value: PixelCharacterId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: PixelCharacterId) => void;
};

export function CharacterPicker({
  value,
  open,
  onOpenChange,
  onChange,
}: CharacterPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const closeAndRestoreFocus = useCallback(() => {
    onOpenChange(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() =>
      itemRefs.current[focusedIndex]?.focus(),
    );

    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeAndRestoreFocus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAndRestoreFocus, focusedIndex, open, onOpenChange]);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const nextIndex = getNextCharacterMenuIndex(
      focusedIndex,
      event.key,
      PIXEL_CHARACTERS.length,
    );
    if (nextIndex === null) return;

    event.preventDefault();
    setFocusedIndex(nextIndex);
    itemRefs.current[nextIndex]?.focus();
  };

  const onPickerBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      onOpenChange(false);
    }
  };

  return (
    <div ref={rootRef} className="relative" onBlur={onPickerBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Choose Pixel character"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="pixel-character-menu"
        onClick={() => {
          if (!open) {
            setFocusedIndex(
              Math.max(
                0,
                PIXEL_CHARACTERS.findIndex(({ id }) => id === value),
              ),
            );
          }
          onOpenChange(!open);
        }}
        className="flex cursor-pointer items-center gap-1 rounded-sm text-inherit outline-none transition-colors hover:text-ink focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span>PIXEL</span>
        <span
          aria-hidden
          className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div
        id="pixel-character-menu"
        role="menu"
        aria-label="Pixel characters"
        tabIndex={-1}
        hidden={!open}
        onKeyDown={onMenuKeyDown}
        className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-44 overflow-hidden rounded-lg border border-border-color bg-surface p-1.5 text-left shadow-lg"
      >
        {PIXEL_CHARACTERS.map((character, index) => (
          <button
            key={character.id}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitemradio"
            aria-checked={value === character.id}
            tabIndex={focusedIndex === index ? 0 : -1}
            onClick={() => {
              onChange(character.id);
              closeAndRestoreFocus();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 font-mono text-metadata leading-none tracking-normal text-ink-dim normal-case transition-colors hover:bg-bg hover:text-ink focus-visible:bg-bg focus-visible:text-ink focus-visible:outline-none aria-checked:bg-accent/10 aria-checked:text-accent"
          >
            <span className="flex h-8 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-bg/70">
              {character.preview ? (
                <Image
                  src={character.preview}
                  alt=""
                  width={38}
                  height={32}
                  loading="eager"
                  unoptimized
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <CurrentPixelRenderer preview />
              )}
            </span>
            <span>{character.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
