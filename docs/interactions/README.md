# Interaction engineering

[← Back to the main README](../../README.md)

I use motion and creative coding to explain hierarchy and make the portfolio feel responsive, while treating every effect as progressive enhancement.

```text
navigation intent
      │
      ├──► native View Transition ──► route reveal / shared-element morph
      ├──► GSAP                  ──► composed timelines and landing details
      └──► Lenis                 ──► smooth document scrolling

prefers-reduced-motion ─────────────► simpler, immediate path
```

## `01` Route transitions

[`PageTransitionOverlay.tsx`](../../components/PageTransitionOverlay.tsx) and [`page-transition-context.tsx`](../../lib/page-transition-context.tsx) provide one transition entry point for several navigation styles:

- A circular reveal that grows from the click or tap position
- A shared-element morph between project cards and case studies
- Directional slides between ordered portfolio sections
- A top-edge shade transition for landing navigation

The route change remains the source of truth. When the View Transitions API is unavailable—or the visitor prefers reduced motion—the navigation takes a simpler path rather than failing.

## `02` Animation without render-loop overhead

I use React for lifecycle and state ownership, but keep frame-by-frame values in refs when they do not need to trigger a component render. Pointer tracking, gait motion, shader updates, and performance tools use `requestAnimationFrame`, observers, and direct visual updates where appropriate.

Lenis owns smooth scrolling across the main portfolio. The photography route intentionally switches to immediate scrolling because its full-screen viewer and touch interactions need different behavior.

## `03` Theme and accent system

The design system is based on semantic CSS variables rather than component-specific colors. Light/dark mode and accent selections are persisted locally, and a small pre-paint script applies them before React hydrates. That avoids briefly displaying the default palette during a revisit.

```text
saved preference ──► pre-paint CSS variables ──► first frame ──► React hydration
```

## `04` Pixel character system

The small pet in the sidebar is a React/SVG character system rather than a sprite animation. It includes:

- Six selectable characters with Dog as the default
- Distance-based walking phases and articulated leg poses
- Direction-correct cursor tracking for the visible eyes
- Character-specific details such as the Dog's intermittent tail wag
- Poke reactions, return greetings, and interaction priorities
- Local persistence for the selected character and visitor memory
- A subtle theme-accent detail shared by every character

Pure helpers handle the gait, eye translation, tail timing, persistence, and speech priority so those behaviors can be tested separately from rendering.

## `05` WebGL and live demos

Three.js and GLSL power the liquid-distortion study and interactive experiments. The cursor writes motion into a lower-resolution simulation field, then a display shader uses that field to distort the image. Device pixel ratio is capped to keep rendering cost bounded.

The photography panorama viewer is also client-only. It adds drag, touch, inertial movement, zoom-aware sensitivity, device orientation, and seam-safe angle handling without making Three.js part of every page.

## Accessibility and fallbacks

- Reduced-motion branches cover route transitions and local animation.
- Keyboard navigation and focus restoration are included in menus, dialogs, and the gallery.
- Live thumbnails keep static poster fallbacks.
- Touch gestures distinguish horizontal viewer intent from vertical page scrolling.
- Expensive previews and developer inspectors load only when needed.

Next: [Photography pipeline →](../photography/README.md)
