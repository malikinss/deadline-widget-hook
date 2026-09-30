// ./test/time.spec.ts

import { describe, expect, it } from "vitest";
import { countdownState, pad2, splitDuration } from "../public/shared/time.js";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("splitDuration", () => {
  it("splits a duration into days, hours, minutes and seconds", () => {
    expect(splitDuration(2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it("treats negative durations as positive", () => {
    expect(splitDuration(-(1 * DAY + 2 * HOUR))).toEqual({
      days: 1,
      hours: 2,
      minutes: 0,
      seconds: 0,
    });
  });

  it("drops fractions of a second", () => {
    expect(splitDuration(1999).seconds).toBe(1);
  });

  it("keeps hours below 24", () => {
    expect(splitDuration(26 * HOUR)).toEqual({ days: 1, hours: 2, minutes: 0, seconds: 0 });
  });
});

describe("countdownState", () => {
  const deadline = Date.UTC(2026, 9, 2, 12, 0);

  it("counts down before the deadline", () => {
    const state = countdownState(deadline, deadline - 5 * HOUR);
    expect(state.overdue).toBe(false);
    expect(state.parts.hours).toBe(5);
  });

  it("is overdue exactly at the deadline", () => {
    expect(countdownState(deadline, deadline).overdue).toBe(true);
  });

  it("counts time since the deadline when overdue", () => {
    const state = countdownState(deadline, deadline + 2 * DAY + 5 * HOUR);
    expect(state.overdue).toBe(true);
    expect(state.parts).toEqual({ days: 2, hours: 5, minutes: 0, seconds: 0 });
  });
});

describe("pad2", () => {
  it("adds a leading zero to single digits", () => {
    expect(pad2(7)).toBe("07");
  });

  it("keeps longer numbers unchanged", () => {
    expect(pad2(123)).toBe("123");
  });
});
