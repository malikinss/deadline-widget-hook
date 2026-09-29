// ./test/urgency.spec.ts

import { describe, expect, it } from "vitest";
import { msUntilNextChange, parseDeadline, pickInk } from "../public/urgency.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("pickInk", () => {
  it("keeps the template color when more than 3 days are left", () => {
    expect(pickInk(4 * DAY)).toBeNull();
  });

  it("is yellow when less than 3 days are left", () => {
    expect(pickInk(2 * DAY)).toBe("FFC800");
  });

  it("is orange when less than 1 day is left", () => {
    expect(pickInk(5 * HOUR)).toBe("FB2A00");
  });

  it("is red when the deadline is reached or passed", () => {
    expect(pickInk(0)).toBe("FF0000");
    expect(pickInk(-HOUR)).toBe("FF0000");
  });

  it("switches right after the 3-day boundary", () => {
    expect(pickInk(3 * DAY)).toBeNull();
    expect(pickInk(3 * DAY - 1)).toBe("FFC800");
  });
});

describe("msUntilNextChange", () => {
  it("waits until 3 days are left", () => {
    expect(msUntilNextChange(5 * DAY)).toBe(2 * DAY + 1);
  });

  it("waits until 1 day is left", () => {
    expect(msUntilNextChange(2 * DAY)).toBe(DAY + 1);
  });

  it("waits until the deadline", () => {
    expect(msUntilNextChange(5 * HOUR)).toBe(5 * HOUR + 1);
  });

  it("does not schedule anything after the deadline", () => {
    expect(msUntilNextChange(-1)).toBeNull();
  });
});

describe("parseDeadline", () => {
  it("reads the to param as local time", () => {
    const url = new URL("https://widget.test/?to=2026-10-01T09:00");
    expect(parseDeadline(url)).toBe(new Date("2026-10-01T09:00").getTime());
  });

  it("returns null when to is missing", () => {
    expect(parseDeadline(new URL("https://widget.test/"))).toBeNull();
  });

  it("returns null when to is invalid", () => {
    expect(parseDeadline(new URL("https://widget.test/?to=soon"))).toBeNull();
  });
});
