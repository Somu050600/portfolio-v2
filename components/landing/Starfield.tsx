import { landingConfig, type StarLayer } from "@/lib/landing.config";

// Seeded starfield — three layers rotating at different speeds (one reversed)
// so the sky feels alive rather than spinning as one sheet.
//
// Stars are generated deterministically (mulberry32) during render, so the
// server and client produce identical markup — no hydration mismatch, and no
// JS needed at runtime (rotation + twinkle are pure CSS).

function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
};

function makeLayer(layer: StarLayer): Star[] {
  const rand = mulberry32(layer.seed);
  const cellSize = 100 / layer.grid;
  const stars: Star[] = [];
  for (let row = 0; row < layer.grid; row++) {
    for (let col = 0; col < layer.grid; col++) {
      const cx = (col + 0.5) * cellSize - 50;
      const cy = (row + 0.5) * cellSize - 50;
      if (Math.sqrt(cx * cx + cy * cy) > layer.maxRadius) continue;
      if (rand() < layer.skipChance) {
        // Burn the same number of rand() calls so star placement stays
        // stable when tuning skipChance.
        rand();
        rand();
        rand();
        rand();
        continue;
      }
      stars.push({
        x: col * cellSize + (rand() * 1.6 - 0.3) * cellSize,
        y: row * cellSize + (rand() * 1.6 - 0.3) * cellSize,
        size: rand() < layer.size[0] ? layer.size[1] : layer.size[2],
        opacity:
          layer.opacity[0] + rand() * (layer.opacity[1] - layer.opacity[0]),
        twinkleDelay: rand() * 14,
      });
    }
  }
  return stars;
}

export default function Starfield() {
  const layers = landingConfig.scenery.starfield.layers;

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
      {layers.map((layer) => (
        <div
          key={layer.seed}
          data-starfield-layer
          className="absolute left-1/2 top-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: `starfield-spin${layer.reverse ? "-reverse" : ""} ${layer.rotationS}s linear infinite`,
          }}
        >
          {makeLayer(layer).map((star, i) => (
            <span
              key={i}
              className="landing-star absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.twinkleDelay}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
