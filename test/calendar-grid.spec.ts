// ./test/calendar-grid.spec.ts

import { describe, expect, it } from "vitest";
import { monthGrid, shiftMonth } from "../public/calendar/calendar-grid.js";

describe("monthGrid", () => {
  it("starts September 2026 on Tuesday", () => {
    const cells = monthGrid(2026, 8);
    expect(cells.slice(0, 3)).toEqual([null, null, 1]);
    expect(cells.filter((day) => day !== null)).toHaveLength(30);
    expect(cells).toHaveLength(35);
  });

  it("fits February 2026 into exactly four weeks", () => {
    const cells = monthGrid(2026, 1);
    expect(cells[0]).toBe(1);
    expect(cells).toHaveLength(28);
  });

  it("needs six weeks for May 2026", () => {
    expect(monthGrid(2026, 4)).toHaveLength(42);
  });

  it("counts 29 days in February of a leap year", () => {
    expect(monthGrid(2028, 1).filter((day) => day !== null)).toHaveLength(29);
  });
});

describe("shiftMonth", () => {
  it("moves to the next month", () => {
    expect(shiftMonth(2026, 8, 1)).toEqual({ year: 2026, month: 9 });
  });

  it("wraps from December to January of the next year", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  });

  it("wraps from January back to December of the previous year", () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});