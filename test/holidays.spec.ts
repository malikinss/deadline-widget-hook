// ./test/holidays.spec.ts

import { describe, expect, it } from "vitest";
import { holidaysOn, mainKind } from "../public/calendar/holidays.js";

/** Local date at noon. */
function day(year: number, month: number, date: number): Date {
  return new Date(year, month - 1, date, 12);
}

/** Names of the holidays on a date. */
function names(date: Date): string[] {
  return holidaysOn(date).map((holiday) => holiday.name);
}

describe("holidaysOn", () => {
  describe("Tishri 5787", () => {
    it("marks Erev Rosh Hashana and both days of Rosh Hashana", () => {
      expect(names(day(2026, 9, 11))).toContain("Erev Rosh Hashana");
      expect(names(day(2026, 9, 12))).toContain("Rosh Hashana I");
      expect(names(day(2026, 9, 13))).toContain("Rosh Hashana II");
    });

    it("marks Tzom Gedaliah", () => {
      expect(names(day(2026, 9, 14))).toContain("Tzom Gedaliah");
    });

    it("marks Erev Yom Kippur and Yom Kippur", () => {
      expect(names(day(2026, 9, 20))).toContain("Erev Yom Kippur");
      expect(holidaysOn(day(2026, 9, 21))).toContainEqual({ name: "Yom Kippur", kind: "holiday" });
    });

    it("marks Sukkot, Chol HaMoed, Hoshana Raba and Shemini Atzeret", () => {
      expect(names(day(2026, 9, 26))).toContain("Sukkot");
      expect(names(day(2026, 9, 28))).toContain("Chol HaMoed Sukkot");
      expect(names(day(2026, 10, 2))).toContain("Hoshana Raba");
      expect(names(day(2026, 10, 3))).toContain("Shemini Atzeret / Simchat Torah");
    });
  });

  it("marks eight days of Hanukkah", () => {
    expect(names(day(2025, 12, 15))).toContain("Hanukkah, day 1");
    expect(names(day(2025, 12, 22))).toContain("Hanukkah, day 8");
    expect(names(day(2025, 12, 23))).toEqual([]);
  });

  describe("Adar", () => {
    it("marks Ta'anit Esther and Purim in a regular year", () => {
      expect(names(day(2025, 3, 13))).toContain("Ta'anit Esther");
      expect(names(day(2025, 3, 14))).toContain("Purim");
    });

    it("moves Ta'anit Esther to Thursday when 13 Adar is Shabbat", () => {
      expect(names(day(2024, 3, 21))).toContain("Ta'anit Esther");
      expect(names(day(2024, 3, 23))).not.toContain("Ta'anit Esther");
    });

    it("marks Purim Katan in Adar I of a leap year", () => {
      expect(names(day(2024, 2, 23))).toContain("Purim Katan");
    });
  });

  describe("Nisan and Iyar", () => {
    it("marks Pesach, Chol HaMoed and Pesach VII", () => {
      expect(names(day(2025, 4, 12))).toContain("Erev Pesach");
      expect(names(day(2025, 4, 13))).toContain("Pesach");
      expect(names(day(2025, 4, 18))).toEqual(["Erev Pesach VII", "Chol HaMoed Pesach"]);
      expect(names(day(2025, 4, 19))).toContain("Pesach VII");
    });

    it("moves Yom HaShoah from Friday to Thursday", () => {
      expect(names(day(2025, 4, 24))).toContain("Yom HaShoah");
      expect(names(day(2025, 4, 25))).not.toContain("Yom HaShoah");
    });

    it("moves Yom HaZikaron and Yom HaAtzmaut before Shabbat", () => {
      expect(names(day(2025, 4, 30))).toContain("Yom HaZikaron");
      expect(names(day(2025, 5, 1))).toContain("Yom HaAtzmaut");
      expect(names(day(2025, 5, 3))).toEqual([]);
    });

    it("moves Yom HaZikaron and Yom HaAtzmaut away from Sunday", () => {
      expect(names(day(2024, 5, 13))).toContain("Yom HaZikaron");
      expect(names(day(2024, 5, 14))).toContain("Yom HaAtzmaut");
    });
  });

  describe("summer fasts", () => {
    it("postpones 17 Tammuz from Shabbat to Sunday", () => {
      expect(names(day(2025, 7, 12))).not.toContain("17 Tammuz");
      expect(names(day(2025, 7, 13))).toContain("17 Tammuz");
    });

    it("postpones Tisha B'Av from Shabbat to Sunday", () => {
      expect(names(day(2025, 8, 2))).not.toContain("Tisha B'Av");
      expect(names(day(2025, 8, 3))).toContain("Tisha B'Av");
    });
  });

  it("returns nothing on a regular day", () => {
    expect(holidaysOn(day(2026, 10, 20))).toEqual([]);
  });
});

describe("mainKind", () => {
  it("prefers erev over festive", () => {
    expect(mainKind(holidaysOn(day(2025, 4, 18)))).toBe("erev");
  });

  it("returns null without holidays", () => {
    expect(mainKind([])).toBeNull();
  });
});
