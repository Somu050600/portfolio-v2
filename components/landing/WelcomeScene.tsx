import Hero from "./Hero";
import LandingCursor from "./LandingCursor";
import ShootingStars from "./ShootingStars";
import Starfield from "./Starfield";
import StatusClock from "./StatusClock";

/**
 * Layer B: the dark space-themed welcome scene. Always dark regardless of
 * theme — it matches the intro overlay's surface so the slide-up reveal
 * is seamless.
 */
export default function WelcomeScene() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#242424] text-[#ece8e1]">
      <Starfield />
      <ShootingStars />
      <Hero />
      <StatusClock />
      <LandingCursor />
    </main>
  );
}
