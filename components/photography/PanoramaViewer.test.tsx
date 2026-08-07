import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import PanoramaViewer, * as panoramaViewer from "./PanoramaViewer";

test("starts a panorama on the opposite side of its previous zero-degree view", () => {
  const createPanoramaControls = (
    panoramaViewer as Record<string, unknown>
  ).createPanoramaControls;

  expect(typeof createPanoramaControls).toBe("function");
  expect(
    (createPanoramaControls as () => { yaw: number; pitch: number; fov: number })(),
  ).toEqual({ yaw: 180, pitch: 0, fov: 72 });

  const markup = renderToStaticMarkup(
    <PanoramaViewer src="/panorama.jpg" posterSrc="/poster.webp" alt="Test" />,
  );
  expect(markup).toContain('data-initial-yaw="180"');
});

test("decays throw velocity by real time, not by frame count", () => {
  const { dampPanoramaVelocity, PANORAMA_FRICTION } = panoramaViewer;
  const oneFrame = 1000 / 60;

  expect(dampPanoramaVelocity(2, oneFrame)).toBeCloseTo(2 * PANORAMA_FRICTION, 6);
  // Half-rate display, double the elapsed time: same decay as two 60fps frames.
  expect(dampPanoramaVelocity(2, oneFrame * 2)).toBeCloseTo(
    dampPanoramaVelocity(dampPanoramaVelocity(2, oneFrame), oneFrame),
    6,
  );
  expect(dampPanoramaVelocity(-2, oneFrame)).toBeCloseTo(-2 * PANORAMA_FRICTION, 6);
});

test("stops the spin once it drops below the perceptible threshold", () => {
  const { dampPanoramaVelocity, PANORAMA_MIN_VELOCITY } = panoramaViewer;

  expect(dampPanoramaVelocity(PANORAMA_MIN_VELOCITY * 0.9, 16)).toBe(0);
  expect(dampPanoramaVelocity(0, 16)).toBe(0);
});

test("follows the gyroscope the short way round the seam", () => {
  const { shortestYawDelta } = panoramaViewer;

  expect(shortestYawDelta(359, 1)).toBeCloseTo(2, 6);
  expect(shortestYawDelta(1, 359)).toBeCloseTo(-2, 6);
  expect(shortestYawDelta(-170, 170)).toBeCloseTo(-20, 6);
  expect(shortestYawDelta(90, 90)).toBeCloseTo(0, 6);
});

test("hands touch gestures to the panorama instead of the page", () => {
  const markup = renderToStaticMarkup(
    <PanoramaViewer src="/panorama.jpg" posterSrc="/poster.webp" alt="Test" />,
  );

  expect(markup).toContain("touch-none");
  expect(markup).toContain("data-panorama");
});
