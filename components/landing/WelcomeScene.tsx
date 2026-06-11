import Hero from "./Hero";
import LandingCursor from "./LandingCursor";
import SceneCanvas from "./SceneCanvas";
import StatusClock from "./StatusClock";

/**
 * Layer B: the dark space-themed welcome scene. Always dark regardless of
 * theme — it matches the intro overlay's surface so the slide-up reveal
 * is seamless.
 */
export default function WelcomeScene() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#242424] text-[#ece8e1]">
      <SceneCanvas />
      <Hero />
      <StatusClock />
      <LandingCursor />
    </main>
  );
}
