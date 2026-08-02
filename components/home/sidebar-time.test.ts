import { describe, expect, test } from "bun:test";
import { formatLocalTime } from "./sidebar-time";

describe("sidebar local time", () => {
  test("formats Bengaluru time from the configured IANA timezone", () => {
    const instant = new Date("2026-08-01T12:30:00.000Z");
    expect(formatLocalTime(instant, "Asia/Kolkata")).toBe("18:00");
  });

  test("keeps the display as a compact 24-hour value", () => {
    const instant = new Date("2026-08-01T21:01:00.000Z");
    expect(formatLocalTime(instant, "Asia/Kolkata")).toBe("02:31");
  });
});
