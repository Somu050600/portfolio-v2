"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

const shirtMask = {
  backgroundColor: "var(--accent)",
  mask: "url('/images/about/somu-shirt-mask.png') center / 100% 100% no-repeat",
  WebkitMask:
    "url('/images/about/somu-shirt-mask.png') center / 100% 100% no-repeat",
} satisfies CSSProperties;

const tintLayer =
  "pointer-events-none absolute inset-0 -translate-x-[0.5px] translate-y-[0.5px] hidden size-full transition-colors duration-350 ease-out supports-[mask-image:linear-gradient(#000,#000)]:block supports-[-webkit-mask-image:linear-gradient(#000,#000)]:block motion-reduce:transition-none";

export default function ThemeTintedPortrait() {
  return (
    <figure className="relative order-1 isolate aspect-1122/1402 w-full shrink-0 overflow-hidden rounded-[14px] border border-border-color bg-surface min-[901px]:w-73">
      <Image
        src="/images/about/somu-portrait.png"
        alt="Somu seated by the sea"
        fill
        sizes="(min-width: 901px) 292px, calc(100vw - 40px)"
        className="object-cover"
      />
      <span
        aria-hidden="true"
        data-shirt-tint="primary"
        className={`${tintLayer} opacity-88 mix-blend-color`}
        style={shirtMask}
      />
      <span
        aria-hidden="true"
        data-shirt-tint="depth"
        className={`${tintLayer} opacity-12 mix-blend-soft-light`}
        style={shirtMask}
      />
    </figure>
  );
}
