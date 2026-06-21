import type { ComponentType } from "react";
import SlidingBarDemo from "./SlidingBarDemo";

export type DemoEntry = {
  /** Label shown on the demo frame. */
  label: string;
  /** Interactive component rendered in the article. */
  Component: ComponentType;
  /** "How it works" reveal — a short note plus the essential code. */
  how: { note: string; lang: string; code: string };
};

export const demoRegistry: Record<string, DemoEntry> = {
  "sliding-bar": {
    label: "Live — click an item",
    Component: () => (
      <SlidingBarDemo className="max-w-full w-fit min-w-3xs mx-auto" />
    ),
    how: {
      note: "The bar lives inside the active list item and is named only during a slide. The browser pairs it across the old and new page and tweens its position — no JS positioning. (The demo above uses a plain CSS transition since it never remounts; the real nav rides the View Transition.)",
      lang: "tsx",
      code: `// markup — bar is a child of the active <li>
<li>
  {isActive && <span data-toc-bar aria-hidden />}
  <Link …>{label}</Link>
</li>

/* css — named only during the page slide, so the
   browser interpolates its position with the slide */
html[data-slide-active] [data-toc-bar] {
  view-transition-name: toc-active-bar;
}`,
    },
  },
};
