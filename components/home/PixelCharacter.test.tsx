import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CurrentPixelRenderer,
  PixelCharacterStage,
} from "./PixelCharacter";
import { CharacterPicker } from "./PixelCharacterPicker";
import {
  PIXEL_CHARACTERS,
  type PixelCharacterId,
} from "./pixel-characters";

function selectedCharacterMarkup(selected: PixelCharacterId) {
  return renderToStaticMarkup(<PixelCharacterStage selected={selected} />);
}

function selectedCharacterRoot(selected: PixelCharacterId) {
  const html = selectedCharacterMarkup(selected);
  return html.match(
    new RegExp(
      `<div data-pixel-character="${selected}"[\\s\\S]*?</div>(?=<div data-pixel-character=|$)`,
    ),
  )?.[0];
}

describe("Pixel character renderers", () => {
  test("keeps all renderers mounted and marks only the selected character active", () => {
    for (const { id } of PIXEL_CHARACTERS) {
      const html = selectedCharacterMarkup(id);
      expect(html.match(/data-pixel-character=/g)?.length).toBe(6);
      expect(html.match(/data-active="true"/g)?.length).toBe(1);
      expect(html.match(/data-active="false"/g)?.length).toBe(5);
      expect(html).toContain(
        `data-pixel-character="${id}" data-active="true"`,
      );
    }
  });

  test("gives every character one subtle detail driven by the active theme accent", () => {
    for (const { id } of PIXEL_CHARACTERS) {
      const root = selectedCharacterRoot(id);

      expect(root?.match(/data-pixel-accent-detail=/g)?.length).toBe(1);
      expect(root).toMatch(/var\(--accent\)|bg-accent/);
    }
  });

  test("gives side-view Dog and Cat four articulated legs in alternating pairs", () => {
    for (const id of ["dog", "cat"] as const) {
      const root = selectedCharacterRoot(id);
      expect(root).toBeDefined();
      expect(root).toContain('data-pixel-profile="side"');
      expect(root?.match(/data-pixel-leg=/g)?.length).toBe(4);
      expect(root?.match(/data-gait-side="0"/g)?.length).toBe(2);
      expect(root?.match(/data-gait-side="1"/g)?.length).toBe(2);
      expect(root?.match(/data-pixel-eye=/g)?.length).toBe(1);
    }
  });

  test("gives Dog a rectangular torso and one articulated dog tail", () => {
    const dog = selectedCharacterRoot("dog");

    expect(dog).toContain('data-pixel-dog-body="rectangular"');
    expect(dog?.match(/data-pixel-tail="dog"/g)?.length).toBe(1);
  });

  test("keeps Sparrow in side profile with one forward-facing eye and layered plumage", () => {
    const sparrow = selectedCharacterRoot("sparrow");

    expect(sparrow).toContain('data-pixel-profile="side"');
    expect(sparrow).toContain('data-pixel-sparrow-facing="forward"');
    expect(sparrow?.match(/data-pixel-eye=/g)?.length).toBe(1);
    expect(sparrow?.match(/data-pixel-wing-detail=/g)?.length).toBe(2);
    expect(sparrow?.match(/data-pixel-tail-feather=/g)?.length).toBe(2);
  });

  test("keeps Sparrow, Penguin, and Frog on the two-leg gait", () => {
    for (const id of ["sparrow", "penguin", "frog"] as const) {
      const root = selectedCharacterRoot(id);
      expect(root).toBeDefined();
      expect(root?.match(/data-pixel-leg=/g)?.length).toBe(2);
    }
  });

  test("keeps Penguin and Frog front-facing with two eyes", () => {
    for (const id of ["penguin", "frog"] as const) {
      expect(selectedCharacterRoot(id)?.match(/data-pixel-eye=/g)?.length).toBe(
        2,
      );
    }
  });

  test("centers the Penguin beak beneath its eyes", () => {
    expect(selectedCharacterRoot("penguin")).toContain(
      'data-pixel-beak="centered"',
    );
  });

  test("reuses the legacy Current Pixel body for the stage and picker preview", () => {
    const stage = selectedCharacterMarkup("current");
    const preview = renderToStaticMarkup(<CurrentPixelRenderer preview />);

    expect(stage).toContain('data-pixel-character="current"');
    expect(stage).toContain("data-pixel-current-renderer");
    expect(stage).toContain("data-pixel-body");
    expect(preview).toContain("data-pixel-current-renderer");
    expect(preview).toContain("data-pixel-current-preview");
  });
});

test("renders the current character artwork in every picker preview", () => {
  const html = renderToStaticMarkup(
    <CharacterPicker
      value="dog"
      open
      onOpenChange={() => {}}
      onChange={() => {}}
    />,
  );

  expect(html).toContain("PIXEL");
  expect(html).toContain('aria-label="Choose Pixel character"');
  expect(html).toContain("data-pixel-picker-icon");
  expect(html).toContain("text-accent");
  expect(html.match(/role="menuitemradio"/g)?.length).toBe(6);
  expect(html.match(/data-pixel-character-preview=/g)?.length).toBe(6);
  for (const { id } of PIXEL_CHARACTERS) {
    expect(html).toContain(`data-pixel-character-preview="${id}"`);
  }
  expect(html).not.toContain("/pixel-characters/previews/");
  expect(html).toContain("Current Pixel");
});
