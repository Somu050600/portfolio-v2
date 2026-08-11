import { describe, expect, test } from "bun:test";
import {
  EMPTY_PIXEL_MEMORY,
  canPixelSpeechReplace,
  getPokeReaction,
  getReturnGreeting,
  readPixelMemory,
  selectScrollThreshold,
} from "./pixel-pet";

describe("Pixel speech arbitration", () => {
  test("lets repeated interactions refresh their own message", () => {
    expect(canPixelSpeechReplace("poke", "poke")).toBe(true);
    expect(canPixelSpeechReplace("nav", "nav")).toBe(true);
  });

  test("keeps lower-priority speech from replacing active speech", () => {
    expect(canPixelSpeechReplace("nav", "poke")).toBe(false);
    expect(canPixelSpeechReplace("poke", "nav")).toBe(true);
  });

  test("lets anything the visitor does interrupt the discovery nudge", () => {
    for (const kind of ["greeting", "nav", "scroll", "poke"] as const) {
      expect(canPixelSpeechReplace(kind, "hint")).toBe(true);
    }
    // The nudge itself never talks over real interaction.
    expect(canPixelSpeechReplace("hint", "poke")).toBe(false);
    expect(canPixelSpeechReplace("hint", "nav")).toBe(false);
  });
});

describe("Pixel poke arc", () => {
  test("follows the fixed script and mood bands", () => {
    expect(getPokeReaction(1, 1, false)).toMatchObject({
      text: "hi there",
      mood: "curious",
      eyeOpacity: 1,
      tone: "body",
    });
    expect(getPokeReaction(7, 7, false)).toMatchObject({
      text: "still poking",
      mood: "wary",
      eyeOpacity: 0.8,
    });
    expect(getPokeReaction(11, 11, false)).toMatchObject({
      text: "somu, come get him",
      mood: "annoyed",
      eyeOpacity: 0.45,
      tone: "punch",
    });
    expect(getPokeReaction(14, 14, false)).toMatchObject({
      text: "that's fourteen",
      mood: "resigned",
      eyeOpacity: 0.28,
      tone: "muted",
    });
    expect(getPokeReaction(17, 17, false)).toMatchObject({
      text: "email him. he likes persistent people",
      mood: "payoff",
      eyeOpacity: 1,
      tone: "accent",
    });
  });

  test("loops the post-payoff lines deterministically", () => {
    expect(getPokeReaction(18, 18, false).text).toBe("we good?");
    expect(getPokeReaction(19, 19, false).text).toBe("still here?");
    expect(getPokeReaction(22, 22, false).text).toBe("we good?");
  });

  test("replaces only the first poke for returning visitors", () => {
    expect(getPokeReaction(1, 8, true).text).toBe("oh. you are back");
    expect(getPokeReaction(1, 21, true).text).toBe("not this again");
    expect(getPokeReaction(2, 22, true).text).toBe("oh, hello again");
  });
});

describe("Pixel memory", () => {
  test("parses only finite non-negative integer fields", () => {
    expect(
      readPixelMemory('{"visits":4,"pokes":55,"last":1754000000000}'),
    ).toEqual({ visits: 4, pokes: 55, last: 1_754_000_000_000 });
    expect(readPixelMemory("not json")).toEqual(EMPTY_PIXEL_MEMORY);
    expect(
      readPixelMemory('{"visits":-2,"pokes":1.5,"last":"yesterday"}'),
    ).toEqual(EMPTY_PIXEL_MEMORY);
  });

  test("selects the return greeting by gap and lifetime pokes", () => {
    const now = 1_800_000_000_000;
    expect(
      getReturnGreeting({ visits: 3, pokes: 3, last: now - 8 * 86_400_000 }, now),
    ).toBe("thought you left");
    expect(
      getReturnGreeting({ visits: 3, pokes: 16, last: now - 1_000 }, now),
    ).toBe("oh good. the poker");
    expect(
      getReturnGreeting({ visits: 3, pokes: 5, last: now - 1_000 }, now),
    ).toBe("you again");
    expect(
      getReturnGreeting({ visits: 1, pokes: 1, last: now - 1_000 }, now),
    ).toBe("welcome back");
  });
});

describe("Pixel scroll thresholds", () => {
  test("returns at most the first unspent crossed threshold", () => {
    expect(selectScrollThreshold(1, new Set())).toEqual({
      threshold: 0.25,
      text: "keep going",
    });
    expect(selectScrollThreshold(1, new Set([0.25]))).toEqual({
      threshold: 0.5,
      text: "halfway",
    });
    expect(
      selectScrollThreshold(0.74, new Set([0.25, 0.5])),
    ).toBeNull();
  });
});
