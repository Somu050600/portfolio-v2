import { describe, expect, test } from "bun:test";
import {
  createSectionSelector,
  getActiveSectionId,
  getSectionProgress,
} from "./case-study-navigation";

describe("case-study section progress", () => {
  test("reports one-based progress for the active section", () => {
    expect(
      getSectionProgress("build", ["context", "build", "outcome"]),
    ).toEqual({
      current: 2,
      total: 3,
      label: "02 / 03",
    });
  });

  test("reports an empty counter when a study has no sections", () => {
    expect(getSectionProgress("", [])).toEqual({
      current: 0,
      total: 0,
      label: "00 / 00",
    });
  });
});

describe("case-study intersection selection", () => {
  const orderedIds = ["context", "build", "outcome"];

  test("selects the intersecting heading nearest the observation line", () => {
    expect(
      getActiveSectionId(
        [
          { id: "context", top: -210 },
          { id: "build", top: 18 },
          { id: "outcome", top: 180 },
        ],
        orderedIds,
        "context",
        24,
      ),
    ).toBe("build");
  });

  test("selects the restored or deep-linked section from all heading positions", () => {
    expect(
      getActiveSectionId(
        [
          { id: "context", top: -680 },
          { id: "build", top: -240 },
          { id: "outcome", top: 92 },
        ],
        orderedIds,
        "context",
        120,
      ),
    ).toBe("outcome");
  });

  test("selects the final section when the article end enters the viewport", () => {
    expect(
      getActiveSectionId(
        [
          { id: "context", top: -680 },
          { id: "build", top: -240 },
          { id: "outcome", top: 520 },
        ],
        orderedIds,
        "build",
        120,
        true,
      ),
    ).toBe("outcome");
  });

  test("keeps the final section active across later heading observations", () => {
    const selector = createSectionSelector(orderedIds);
    const positions = [
      { id: "context", top: -680 },
      { id: "build", top: -240 },
      { id: "outcome", top: 520 },
    ];

    selector.setArticleEndVisible(true);

    expect(selector.select(positions, "build", 120)).toBe("outcome");
    expect(selector.select(positions, "outcome", 120)).toBe("outcome");
  });
});
