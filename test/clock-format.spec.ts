// ./test/clock-format.spec.ts

import { describe, expect, it } from "vitest";
import { clockParts, dateLabel } from "../public/clock/clock-format.js";

describe("clockParts", () => {
  it("pads hours, minutes and seconds to two digits", () => {
    expect(clockParts(new Date(2026, 8, 30, 9, 5, 7))).toEqual({
      hours: "09",
      minutes: "05",
      seconds: "07",
    });
  });

  it("uses 24-hour time", () => {
    expect(clockParts(new Date(2026, 8, 30, 21, 30, 0)).hours).toBe("21");
  });

  it("shows midnight as 00", () => {
    expect(clockParts(new Date(2026, 8, 30, 0, 0, 0)).hours).toBe("00");
  });
});

describe("dateLabel", () => {
  it("formats the weekday and date", () => {
    expect(dateLabel(new Date(2026, 8, 30))).toBe("Wed, Sep 30");
  });

  it("does not pad the day of the month", () => {
    expect(dateLabel(new Date(2026, 9, 4))).toBe("Sun, Oct 4");
  });

  it("handles the first and last months", () => {
    expect(dateLabel(new Date(2026, 0, 1))).toBe("Thu, Jan 1");
    expect(dateLabel(new Date(2026, 11, 31))).toBe("Thu, Dec 31");
  });
});
