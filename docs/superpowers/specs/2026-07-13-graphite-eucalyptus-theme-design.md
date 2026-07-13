# Graphite + Eucalyptus Portfolio Redesign

## Goal

Refine the portfolio into a calm, professional frontend-engineering identity while preserving its personal signature, dark-only landing page, light/dark home themes, theme customizer, and View Transition interactions.

## Brand direction

The default visual identity is **Graphite + Eucalyptus**:

- Neutral graphite/green-black dark surfaces.
- Cool off-white light surfaces rather than warm cream.
- Eucalyptus as the default interaction accent in both modes.
- Accent colour is used for behaviour—focus, selection, active navigation, hover outlines, and transition details—not as large decorative scenery.

Alternative accents remain available through the existing theme customizer as a hidden reward for visitors who explore the settings.

## Landing page

- Keep the signature intro and dark-only scene.
- Replace the centred “Somu's World” splash with an asymmetric professional hero.
- Lead with a clear value proposition about building interfaces that remain simple as products become complex.
- Keep the title spotlight and restrained star field.
- Remove shooting stars, click sparkles, cursor-shove words, and unnecessary parallax so the route transition remains the primary technical flourish.
- Show Bengaluru/IST context and current role instead of a generic systems-status message.
- Maintain keyboard entry, reduced-motion support, route prefetching, and the existing View Transition navigation flow.

## Home page

- Preserve the sidebar, project grouping, command palette, case-study structure, and all View Transition behaviour.
- Replace warm paper tokens with cooler professional neutrals.
- Use eucalyptus as the default accent in both light and dark modes.
- Flatten project cards: quieter shadow, subtle border, reduced visual tilt, and accent keyline on hover.
- Keep all existing accent options in the customizer.
- Refine supporting copy to emphasize shipped systems, performance, and production-quality frontend work.

## Accessibility and performance

- Increase contrast for meaningful small landing-page text.
- Preserve `prefers-reduced-motion` handling.
- Do not add dependencies.
- Continue using semantic CSS variables so all existing components inherit the redesign.
- Keep pre-paint theme variables synchronized with runtime defaults to avoid flashes during hydration.
