// ./public/time.js

/**
 * Time helpers for the countdown widget.
 */

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/**
 * Splits a duration into whole days, hours, minutes and seconds.
 * @param {number} ms - Duration in milliseconds; negative values are treated as positive.
 * @returns {{ days: number, hours: number, minutes: number, seconds: number }}
 */
export function splitDuration(ms) {
  const total = Math.floor(Math.abs(ms) / 1000);
  return {
    days: Math.floor(total / SECONDS_PER_DAY),
    hours: Math.floor(total / SECONDS_PER_HOUR) % 24,
    minutes: Math.floor(total / SECONDS_PER_MINUTE) % 60,
    seconds: total % 60,
  };
}

/**
 * Describes the countdown at a given moment.
 * @param {number} deadline - Deadline timestamp in milliseconds.
 * @param {number} now - Current timestamp in milliseconds.
 * @returns {{ overdue: boolean, parts: ReturnType<typeof splitDuration> }}
 * Parts show the time left, or the time since the deadline when overdue.
 */
export function countdownState(deadline, now) {
  const remaining = deadline - now;
  return { overdue: remaining <= 0, parts: splitDuration(remaining) };
}

/**
 * Formats a number with at least two digits.
 * @param {number} value - Non-negative integer.
 * @returns {string} For example `7` → `"07"`, `123` → `"123"`.
 */
export function pad2(value) {
  return String(value).padStart(2, "0");
}
