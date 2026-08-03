import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { profile } from "@/lib/profile.config";

mock.module("next/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: Sidebar } = await import("./Sidebar");

test("keeps sidebar status and timezone in profile configuration", () => {
  expect(profile.role).toBe("Frontend developer");
  expect(profile.availability).toBe("Open to work");
  expect(profile.timeZone).toBe("Asia/Kolkata");
});

test("loads home-sidebar fonts from the home layout", () => {
  const layoutPath = fileURLToPath(
    new URL("../../app/home/layout.tsx", import.meta.url),
  );
  const sidebarPath = fileURLToPath(new URL("./Sidebar.tsx", import.meta.url));
  const layoutSource = readFileSync(layoutPath, "utf8");
  const sidebarSource = readFileSync(sidebarPath, "utf8");

  expect(layoutSource).toContain("Instrument_Serif");
  expect(layoutSource).toContain("JetBrains_Mono");
  expect(layoutSource).toContain("Poppins");
  expect(layoutSource).toContain("--font-home-instrument");
  expect(layoutSource).toContain("--font-home-jetbrains");
  expect(layoutSource).toContain("--font-home-poppins");
  expect(sidebarSource).not.toContain('from "next/font/google"');
});

test("React server rendering remains available to home component tests", () => {
  expect(renderToStaticMarkup(<span>home</span>)).toBe("<span>home</span>");
});

test("links the Somu wordmark back to the landing page", () => {
  const markup = renderToStaticMarkup(<Sidebar />);
  expect(markup).toContain('href="/"');
});

test("keeps Pixel isolated in a token-backed desktop card", () => {
  const pixelPath = fileURLToPath(new URL("./PixelPet.tsx", import.meta.url));

  expect(existsSync(pixelPath)).toBe(true);
  if (!existsSync(pixelPath)) return;

  const pixelSource = readFileSync(pixelPath, "utf8");
  expect(pixelSource).toContain('aria-hidden="true"');
  expect(pixelSource).toContain("h-38");
  expect(pixelSource).toContain("border-border-color");
  expect(pixelSource).toContain("data-pixel-track");
  expect(pixelSource).toContain("data-pixel-pet");
  expect(pixelSource).toContain("requestAnimationFrame");
  expect(pixelSource).toContain("visibilitychange");
  expect(pixelSource).toContain("prefers-reduced-motion");
  expect(pixelSource).not.toMatch(/#[0-9a-f]{3,8}/i);
});

test("uses router-owned, numbered navigation without decorative active chrome", () => {
  const navPath = fileURLToPath(
    new URL("./TableOfContents.tsx", import.meta.url),
  );
  const navSource = readFileSync(navPath, "utf8");

  expect(navSource).toContain("usePathname");
  expect(navSource).toContain("data-pixel-nav");
  expect(navSource).toContain("font-home-poppins");
  expect(navSource).toContain("font-home-jetbrains");
  expect(navSource).not.toContain("data-toc-pill");
  expect(navSource).not.toContain("data-toc-bar");
  expect(navSource).not.toContain("PILL_TRANSITION");
});

test("composes the desktop rail and mobile disclosure from the same sidebar", () => {
  const sidebarPath = fileURLToPath(new URL("./Sidebar.tsx", import.meta.url));
  const sidebarSource = readFileSync(sidebarPath, "utf8");

  expect(sidebarSource).toContain("PixelPet");
  expect(sidebarSource).toContain('data-sidebar-spacer');
  expect(sidebarSource).toContain('data-mobile-menu');
  expect(sidebarSource).toContain("MENU");
  expect(sidebarSource).toContain("profile.availability");
  expect(sidebarSource).toContain("profile.timeZone");
  expect(sidebarSource).toContain("Email me");
  expect(sidebarSource).toContain('variant="sidebar"');
  expect(sidebarSource).toContain("UI_EVENTS.commandPaletteOpen");
  expect(sidebarSource).toContain("lg:w-75");
  expect(sidebarSource).toContain('className="sticky top-0');
});

test("isolates the sticky mobile navbar from sliding page snapshots", () => {
  const markup = renderToStaticMarkup(<Sidebar />);
  const globalStylesPath = fileURLToPath(
    new URL("../../app/globals.css", import.meta.url),
  );
  const globalStyles = readFileSync(globalStylesPath, "utf8");

  expect(markup).toContain("data-home-sidebar");
  expect(globalStyles).toContain(
    "html[data-slide-active] [data-home-sidebar]",
  );
  expect(globalStyles).toContain("view-transition-name: home-sidebar");
  expect(globalStyles).toContain("::view-transition-group(home-sidebar)");
});

test("moves contact links into a mobile-only home footer", () => {
  const footerPath = fileURLToPath(new URL("./HomeFooter.tsx", import.meta.url));
  const shellPath = fileURLToPath(new URL("./HomeShell.tsx", import.meta.url));

  expect(existsSync(footerPath)).toBe(true);
  if (!existsSync(footerPath)) return;

  const footerSource = readFileSync(footerPath, "utf8");
  const shellSource = readFileSync(shellPath, "utf8");
  expect(footerSource).toContain("Email me");
  expect(footerSource).toContain("lg:hidden");
  expect(shellSource).toContain("HomeFooter");
});
