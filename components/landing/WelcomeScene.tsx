import Hero from "./Hero";
import LandingCursor from "./LandingCursor";
import SceneCanvas from "./SceneCanvas";
import StatusClock from "./StatusClock";

/**
 * Layer B: the welcome scene.
 *
 * Always dark, self-contained — the `.dark` class pins the dark CSS vars
 * (--bg → #0A0A0A, --ink → #EDEDED, etc.) regardless of the global theme
 * toggle. The AccentProvider's dark-accent vars are also in effect here since
 * they're on <html>, not scoped to `.dark`.
 *
 * The canvas uses hardcoded colours (white stars, etc.) and is independent
 * of the token system; the scene-surface/scene-ink tokens cover any text
 * or chrome that appears here.
 */
export default function WelcomeScene() {
  return (
    <main className="dark relative min-h-dvh overflow-hidden bg-(--landing-bg) text-ink select-none">
      <SceneCanvas />
      <Hero />
      <StatusClock />
      <LandingCursor />
    </main>
  );
}
