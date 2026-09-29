// ./test/datetime.spec.ts

import { describe, expect, it } from "vitest";
import { toWallClock } from "../src/lib/datetime";

describe("toWallClock", () => {
  it("keeps wall-clock time in summer (UTC+3)", () => {
    expect(toWallClock("2026-10-02T09:00:00.000+03:00")).toBe("2026-10-02T09:00");
  });

  it("keeps wall-clock time in winter (UTC+2)", () => {
    expect(toWallClock("2026-12-01T09:00:00.000+02:00")).toBe("2026-12-01T09:00");
  });

  it("uses midnight for date without time", () => {
    expect(toWallClock("2026-10-02")).toBe("2026-10-02T00:00");
  });

  it("uses the given default time for date without time", () => {
    expect(toWallClock("2026-10-02", "12:00")).toBe("2026-10-02T12:00");
  });

  it("ignores the default time when time is present", () => {
    expect(toWallClock("2026-10-02T09:00:00.000+03:00", "12:00")).toBe("2026-10-02T09:00");
  });
});