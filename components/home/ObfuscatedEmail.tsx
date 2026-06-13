"use client";

import { useCallback } from "react";
import { profile } from "@/lib/profile.config";

const USER = "somasekhareega";
const DOMAIN = "gmail.com";

/** Obfuscated email — not a raw mailto in SSR HTML. */
export default function ObfuscatedEmail() {
  const reveal = useCallback(() => {
    window.location.href = `mailto:${USER}@${DOMAIN}`;
  }, []);

  return (
    <button
      type="button"
      onClick={reveal}
      className="text-left text-sm text-ink-dim underline-offset-2 hover:text-ink hover:underline"
    >
      <span aria-hidden>
        {USER}
        <span className="text-ink-faint"> [at] </span>
        {DOMAIN.replace(".", " [dot] ")}
      </span>
      <span className="sr-only">
        Email {USER} at {DOMAIN}
      </span>
    </button>
  );
}

export function ResumeLink() {
  return (
    <a
      href={profile.contact.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border-color bg-surface px-4 py-2 font-mono text-xs tracking-wide text-ink transition-colors hover:border-ink-faint"
    >
      Download résumé
      <span aria-hidden>↓</span>
    </a>
  );
}
