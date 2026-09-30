// ./public/calendar/calendar-grid.js

/**
 * Month grid math for the calendar widget.
 */

/**
 * Builds the cells of a month view, with weeks starting on Sunday.
 * @param {number} year - Full year, for example 2026.
 * @param {number} month - Month from 0 (January) to 11 (December).
 * @returns {(number | null)[]} Days of the month, with null for empty cells
 * before the 1st and after the last day. The length is a multiple of 7.
 */
export function monthGrid(year, month) {
  const leadingEmpty = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(leadingEmpty).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * Moves a month view forward or backward.
 * @param {number} year - Current year.
 * @param {number} month - Current month from 0 to 11.
 * @param {number} delta - Number of months to move, negative to go back.
 * @returns {{ year: number, month: number }} The new month.
 */
export function shiftMonth(year, month, delta) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}