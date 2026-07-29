import GuillocheBackground from "./GuillocheBackground";
import LandingHero from "./LandingHero";

/**
 * Layer B: the welcome scene.
 *
 * The interactive client shell accepts the guilloché as a server-rendered
 * slot, keeping its 113 SVG paths out of the client module graph.
 */
export default function WelcomeScene() {
  return (
    <LandingHero
      background={
        <GuillocheBackground
          amplitude={40}
          density={11}
          lightness={0.26}
          centreRelief
          className="z-0 text-(--landing-pattern)"
        />
      }
    />
  );
}
