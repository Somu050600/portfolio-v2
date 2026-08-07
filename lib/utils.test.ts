import { expect, test } from "bun:test";

import { cn } from "./utils";

test("preserves semantic type sizes alongside text colors", () => {
  expect(cn("text-page-title", "text-ink")).toBe(
    "text-page-title text-ink",
  );
  expect(cn("text-body-sm", "text-ink-dim")).toBe(
    "text-body-sm text-ink-dim",
  );
});
