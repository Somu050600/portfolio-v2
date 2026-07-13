# Graphite + Eucalyptus Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Graphite + Eucalyptus the professional default identity across the dark landing page and light/dark home experience while preserving optional accent customisation and existing View Transition behaviour.

**Architecture:** Keep the existing semantic-token architecture and update its default neutral and accent values. Refine landing content and composition through the existing config/components, and simplify only decorative interactions while retaining accessibility, prefetching, spotlight interaction, and navigation transitions.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, CSS custom properties, Canvas 2D, View Transition API, GSAP.

## Global Constraints

- Keep `/` dark-only.
- Keep `/home` light and dark modes.
- Keep all current accent choices in the theme customizer.
- Use Eucalyptus as the default accent in both modes.
- Preserve the existing route, theme, section, and shared-element View Transitions.
- Preserve reduced-motion fallbacks.
- Add no dependencies.

---

### Task 1: Update the semantic theme defaults

**Files:**
- Modify: `lib/theme.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing `AccentKey`, `ACCENTS`, `THEME_DEFAULTS`, `accentVars`, and CSS semantic tokens.
- Produces: synchronized eucalyptus runtime/pre-paint defaults and graphite neutral surfaces.

- [ ] Rename the existing emerald swatch to Eucalyptus and set its light/dark values to `#2F6F62` / `#7FC3B1`.
- [ ] Set both default accent keys to `emerald` so old customizer logic remains compatible.
- [ ] Synchronize the pre-paint fallback map and defaults.
- [ ] Replace light warm-paper tokens with cool off-white graphite neutrals.
- [ ] Replace dark neutral tokens with subtle green-black graphite neutrals.
- [ ] Update browser `themeColor` metadata.

### Task 2: Professionalize the landing hero

**Files:**
- Modify: `lib/landing.config.ts`
- Modify: `components/landing/Hero.tsx`
- Modify: `components/landing/StatusClock.tsx`

**Interfaces:**
- Consumes: existing `landingConfig.hero`, `usePageTransition`, `SpotlightTitle`, and status clock configuration.
- Produces: asymmetric value-proposition hero with the same transition entry point and a Bengaluru/IST role line.

- [ ] Replace splash copy with a frontend-engineering value proposition.
- [ ] Use an asymmetric left-aligned composition on desktop while keeping mobile responsive.
- [ ] Keep the spotlight title, Enter-key navigation, route prefetch, and CTA transition origin.
- [ ] Remove word-shove and hero parallax behaviour.
- [ ] Increase contrast of meaningful small text.
- [ ] Render a stable Asia/Kolkata clock label and current-role status.

### Task 3: Reduce decorative scene motion

**Files:**
- Modify: `components/landing/SceneCanvas.tsx`
- Modify: `lib/landing.config.ts`

**Interfaces:**
- Consumes: existing deterministic star-layer configuration and pointer broadcast.
- Produces: restrained star field with subtle pointer parallax and no shooting-star or click-sparkle systems.

- [ ] Remove shooter and sparkle types, storage, timers, event handlers, and draw loops.
- [ ] Retain deterministic star generation, twinkle, rotation, pointer parallax, visibility pause, resize handling, and reduced-motion behaviour.
- [ ] Reduce layer density and opacity in configuration.

### Task 4: Refine home copy and project-card surfaces

**Files:**
- Modify: `lib/profile.config.ts`
- Modify: `components/home/ProjectIndexCard.tsx`

**Interfaces:**
- Consumes: existing profile configuration and project-card morph hooks.
- Produces: production-focused guide copy and flatter cards without changing routing or morph contracts.

- [ ] Replace the production-incident joke with copy focused on shipped systems, performance, and product work.
- [ ] Add a subtle border and quieter shadow to cards.
- [ ] Remove visible default rotation while retaining the existing prop/API.
- [ ] Keep accent hover keyline, prefetch, scroll restoration, and forward/back shared-element morphs.

### Task 5: Verify and publish

**Files:**
- Inspect all modified files and the branch diff.

**Interfaces:**
- Produces: a draft PR targeting `main`.

- [ ] Confirm the branch diff contains only the design spec, plan, and intended theme/landing/card changes.
- [ ] Run repository CI checks after opening the PR and report their actual status without claiming local build success.
- [ ] Open a draft pull request with rationale, scope, accessibility notes, and validation limitations.
