"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccent } from "./AccentProvider";
import {
  ACCENTS,
  THEME_DEFAULTS,
  type AccentKey,
  type Mode,
  type ThemeDraft,
} from "@/lib/theme.config";

// ---------------------------------------------------------------------------
// Gear icon — exported so Header / Sidebar can mount the full panel anywhere
// ---------------------------------------------------------------------------
export function ThemeCustomizerTrigger() {
  return (
    <Tooltip>
      {/*
       * Base UI composition: TooltipTrigger → DialogTrigger → <button>.
       * The `render` chain collapses all three into a single DOM <button>
       * that is both the tooltip trigger and the dialog trigger.
       */}
      <TooltipTrigger
        render={
          <DialogPrimitive.Trigger
            render={
              <button
                type="button"
                aria-label="Customize theme"
                className="flex size-9 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/8 hover:text-ink"
              />
            }
          />
        }
      >
        <GearIcon />
      </TooltipTrigger>
      <TooltipContent side="bottom">Customize theme</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// ThemeCustomizer — non-modal corner panel (wraps a Dialog.Root)
// Children should include <ThemeCustomizerTrigger /> to open the panel.
// ---------------------------------------------------------------------------
export function ThemeCustomizer({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { committed, preview, clearPreview, commit, reset } = useAccent();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ThemeDraft>(committed);


  const dirty =
    draft.mode !== ((theme ?? THEME_DEFAULTS.mode) as Mode) ||
    draft.darkAccent !== committed.darkAccent ||
    draft.lightAccent !== committed.lightAccent;

  const updateDraft = (next: Partial<ThemeDraft>) => {
    const updated = { ...draft, ...next };
    setDraft(updated);
    preview(updated);
  };

  const handleConfirm = () => {
    commit(draft);
    setOpen(false);
  };

  const handleCancel = () => {
    clearPreview();
    setOpen(false);
  };

  const handleReset = () => {
    const d: ThemeDraft = { ...THEME_DEFAULTS };
    setDraft(d);
    reset();
  };

  const coolKeys: AccentKey[] = ["blue", "sky", "cyan", "indigo", "violet", "emerald"];
  const warmKeys: AccentKey[] = ["terracotta", "coral", "amber"];

  return (
    <DialogPrimitive.Root
      modal={false}
      open={open}
      onOpenChange={(v: boolean) => {
        if (v) {
          // Sync draft to latest committed state when the panel opens.
          setDraft({
            mode: (theme ?? THEME_DEFAULTS.mode) as Mode,
            darkAccent: committed.darkAccent,
            lightAccent: committed.lightAccent,
          });
          setOpen(true);
        } else {
          handleCancel();
        }
      }}
    >
      {children}

      <DialogPrimitive.Portal>
        {/* Transparent backdrop — page stays fully interactive for live preview */}
        <DialogPrimitive.Backdrop className="pointer-events-none fixed inset-0 z-[9980] bg-transparent" />
        <DialogPrimitive.Popup
          className="fixed right-4 top-16 z-[9981] w-[296px] rounded-xl border border-border-color bg-elevated p-5 shadow-xl outline-none md:right-6"
          aria-label="Theme customizer"
        >
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-dim">
            Customize
          </p>

          {/* Mode */}
          <section>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Mode
            </p>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateDraft({ mode: m })}
                  className={`flex-1 rounded-md border px-2 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
                    draft.mode === m
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border-color text-ink-dim hover:border-ink-faint hover:text-ink"
                  }`}
                >
                  {m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <Separator className="my-4 bg-border-color" />

          {/* Dark accent */}
          <section>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Dark accent
            </p>
            <AccentGrid
              coolKeys={coolKeys}
              warmKeys={warmKeys}
              selected={draft.darkAccent}
              mode="dark"
              onSelect={(k) => updateDraft({ darkAccent: k })}
            />
          </section>

          <Separator className="my-4 bg-border-color" />

          {/* Light accent */}
          <section>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Light accent
            </p>
            <AccentGrid
              coolKeys={coolKeys}
              warmKeys={warmKeys}
              selected={draft.lightAccent}
              mode="light"
              onSelect={(k) => updateDraft({ lightAccent: k })}
            />
          </section>

          <Separator className="my-4 bg-border-color" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-[11px] tracking-wide text-ink-faint transition-colors hover:text-ink-dim"
            >
              Reset to defaults
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-border-color px-3 py-1.5 font-mono text-[11px] tracking-wide text-ink-dim transition-colors hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={handleConfirm}
                className="rounded-md bg-accent px-3 py-1.5 font-mono text-[11px] tracking-wide text-accent-fg transition-opacity disabled:opacity-40"
              >
                Confirm
              </button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Accent swatch grid
// ---------------------------------------------------------------------------
function AccentGrid({
  coolKeys,
  warmKeys,
  selected,
  mode,
  onSelect,
}: {
  coolKeys: AccentKey[];
  warmKeys: AccentKey[];
  selected: AccentKey;
  mode: "light" | "dark";
  onSelect: (k: AccentKey) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {coolKeys.map((k) => (
          <Swatch key={k} accentKey={k} mode={mode} selected={selected === k} onSelect={onSelect} />
        ))}
      </div>
      <div className="flex gap-2">
        {warmKeys.map((k) => (
          <Swatch key={k} accentKey={k} mode={mode} selected={selected === k} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function Swatch({
  accentKey,
  mode,
  selected,
  onSelect,
}: {
  accentKey: AccentKey;
  mode: "light" | "dark";
  selected: boolean;
  onSelect: (k: AccentKey) => void;
}) {
  const a = ACCENTS[accentKey];
  const color = mode === "dark" ? a.dark : a.light;
  return (
    <Tooltip>
      {/* TooltipTrigger renders directly as the color circle button. */}
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={a.name}
            onClick={() => onSelect(accentKey)}
            style={{ background: color }}
            className={`size-7 rounded-full transition-transform ${
              selected
                ? "ring-2 ring-ink ring-offset-2 ring-offset-elevated scale-110"
                : "hover:scale-110"
            }`}
          />
        }
      />
      <TooltipContent side="top">{a.name}</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Gear icon SVG
// ---------------------------------------------------------------------------
function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
