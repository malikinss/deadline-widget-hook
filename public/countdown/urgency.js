// ./public/countdown/urgency.js

/**
 * Urgency rules for the countdown widget: which ink color to use
 * depending on how much time is left until the deadline.
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SOON_MS = 3 * DAY_MS;

const INK_SOON = "FFC800"; // less than 3 days left
const INK_LAST_DAY = "FB2A00"; // less than 1 day left
const INK_OVERDUE = "FF0000"; // deadline reached

/**
 * Picks the ink color for the remaining time.
 * @param {number} remainingMs - Time left until the deadline, in milliseconds.
 * @returns {string | null} Hex color without `#`, or null to keep the template color.
 */
export function pickInk(remainingMs) {
  if (remainingMs <= 0) return INK_OVERDUE;
  if (remainingMs < DAY_MS) return INK_LAST_DAY;
  if (remainingMs < SOON_MS) return INK_SOON;
  return null;
}

/**
 * Reads the deadline from the widget URL `to` parameter.
 * The value is local wall-clock time, so it is parsed in the viewer's time zone.
 * @param {URL} widgetUrl - Widget URL.
 * @returns {number | null} Deadline timestamp in milliseconds, or null if missing or invalid.
 */
export function parseDeadline(widgetUrl) {
  const value = widgetUrl.searchParams.get("to");
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}