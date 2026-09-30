// ./test/hebrew-date.spec.ts

import { describe, expect, it } from "vitest";
import { toHebrewDate } from "../public/calendar/hebrew-date.js";

/** Local date at noon, to stay away from any midnight edge cases. */
function day(year: number, month: number, date: number): Date {
  return new Date(year, month - 1, date, 12);
}

describe("toHebrewDate", () => {
  it("converts Rosh Hashana 5787", () => {
    expect(toHebrewDate(day(2026, 9, 12))).toEqual({ year: 5787, month: "Tishri", day: 1 });
  });

  it("converts Yom Kippur 5787", () => {
    expect(toHebrewDate(day(2026, 9, 21))).toEqual({ year: 5787, month: "Tishri", day: 10 });
  });

  it("converts the first day of Hanukkah 5786", () => {
    expect(toHebrewDate(day(2025, 12, 15))).toEqual({ year: 5786, month: "Kislev", day: 25 });
  });

  it("converts Purim in a regular year", () => {
    expect(toHebrewDate(day(2025, 3, 14))).toEqual({ year: 5785, month: "Adar", day: 14 });
  });

  it("treats Adar II of a leap year as Adar", () => {
    expect(toHebrewDate(day(2024, 3, 24))).toEqual({ year: 5784, month: "Adar", day: 14 });
  });

  it("keeps Adar I of a leap year separate", () => {
    expect(toHebrewDate(day(2024, 2, 23))).toEqual({ year: 5784, month: "Adar I", day: 14 });
  });
});