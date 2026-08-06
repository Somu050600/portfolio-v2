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
