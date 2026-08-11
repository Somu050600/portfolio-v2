"use client";

import { profile } from "@/lib/profile.config";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const RESET_MS = 1800;

/**
 * The address in plain text with a copy affordance. `mailto:` has a real
 * failure rate on machines with no mail client, and the footer already exposes
 * the raw address anyway, so hiding it behind [at]/[dot] only cost humans.
 */
export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // Clipboard denied or unavailable. The address is on screen to select.
      setCopied(false);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate font-mono text-metadata leading-[1.6] font-normal tracking-wider text-ink-faint">
        {profile.contact.email}
      </span>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "ml-auto shrink-0 rounded-full border border-border-color px-2 py-1 font-mono text-metadata leading-none font-medium tracking-widest text-ink-dim uppercase transition-[color,border-color] hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
          copied && "border-accent text-accent",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}
