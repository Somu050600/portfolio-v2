import { profile } from "@/lib/profile.config";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import WorkHero from "./WorkHero";
import * as workHeroModule from "./WorkHero";

describe("WorkHero", () => {
  test("renders one semantic headline that can wrap at the available width", () => {
    const markup = renderToStaticMarkup(<WorkHero />);

    expect(profile.hero.headline).toBe(
      "Design systems, performance, and the unglamorous middle",
    );
    expect(markup).not.toContain("data-hero-line");
    expect(markup).toContain(profile.hero.headline);
    expect(markup).toContain("font-display");
    expect(markup).toContain("text-display-hero");
    expect(markup).toContain("font-body");
    expect(markup).not.toContain("font-serif");
  });

  test("animates every visual line together", () => {
    const createLineReveal = (
      workHeroModule as typeof workHeroModule & {
        createWorkHeroLineReveal?: (
          lines: object[],
        ) => gsap.core.Tween;
      }
    ).createWorkHeroLineReveal;

    expect(createLineReveal).toBeFunction();

    const lines = [{ yPercent: 0 }, { yPercent: 0 }, { yPercent: 0 }];
    const tween = createLineReveal!(lines);

    expect(tween.targets()).toEqual(lines);
    expect(tween.vars.stagger).toBeUndefined();
    expect(tween.duration()).toBe(1);
    tween.eventCallback("onInterrupt", null);
    tween.kill();
  });
});
