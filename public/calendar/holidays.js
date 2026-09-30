// ./public/calendar/holidays.js

/**
 * Jewish and Israeli holidays for the calendar widget, following the Israeli schedule.
 */

import { toHebrewDate } from "./hebrew-date.js";

/**
 * @typedef {"holiday" | "erev" | "memorial" | "festive"} HolidayKind
 * @typedef {{ name: string, kind: HolidayKind }} Holiday
 */

// Kinds from the most to the least important; used to pick one color per day.
export const KIND_PRIORITY = ["holiday", "erev", "memorial", "festive"];

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

// Holidays on a fixed Hebrew date: [month, day, name, kind].
const FIXED = [
  ["Tishri", 1, "Rosh Hashana I", "holiday"],
  ["Tishri", 2, "Rosh Hashana II", "holiday"],
  ["Tishri", 9, "Erev Yom Kippur", "erev"],
  ["Tishri", 10, "Yom Kippur", "holiday"],
  ["Tishri", 14, "Erev Sukkot", "erev"],
  ["Tishri", 15, "Sukkot", "holiday"],
  ["Tishri", 21, "Hoshana Raba", "erev"],
  ["Tishri", 22, "Shemini Atzeret / Simchat Torah", "holiday"],
  ["Tevet", 10, "Asara B'Tevet", "memorial"],
  ["Shevat", 15, "Tu BiShvat", "festive"],
  ["Adar I", 14, "Purim Katan", "festive"],
  ["Adar", 14, "Purim", "festive"],
  ["Adar", 15, "Shushan Purim", "festive"],
  ["Nisan", 14, "Erev Pesach", "erev"],
  ["Nisan", 15, "Pesach", "holiday"],
  ["Nisan", 20, "Erev Pesach VII", "erev"],
  ["Nisan", 21, "Pesach VII", "holiday"],
  ["Iyar", 18, "Lag BaOmer", "festive"],
  ["Iyar", 28, "Yom Yerushalayim", "festive"],
  ["Sivan", 5, "Erev Shavuot", "erev"],
  ["Sivan", 6, "Shavuot", "holiday"],
  ["Av", 15, "Tu B'Av", "festive"],
  ["Elul", 29, "Erev Rosh Hashana", "erev"],
];

// Holidays over a range of days in one month: [month, firstDay, lastDay, name, kind].
const RANGES = [
  ["Tishri", 16, 20, "Chol HaMoed Sukkot", "festive"],
  ["Nisan", 16, 20, "Chol HaMoed Pesach", "festive"],
];

/**
 * Returns the local date a given number of days away, at noon.
 * @param {Date} date
 * @param {number} days
 */
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}

/**
 * Checks whether a Hebrew date matches a month and day.
 * @param {{ month: string, day: number }} hebrew
 * @param {string} month
 * @param {number} day
 */
function is(hebrew, month, day) {
  return hebrew.month === month && hebrew.day === day;
}

/**
 * Returns the day of Hanukkah (1 to 8), or 0 if the date is not in Hanukkah.
 * @param {Date} date
 */
function hanukkahDay(date) {
  for (let offset = 0; offset < 8; offset++) {
    if (is(toHebrewDate(addDays(date, -offset)), "Kislev", 25)) return offset + 1;
  }
  return 0;
}

/**
 * Checks for a fast that is postponed to Sunday when it falls on Shabbat.
 * @param {{ month: string, day: number }} hebrew
 * @param {number} weekday
 * @param {string} month
 * @param {number} day
 */
function isPostponedFast(hebrew, weekday, month, day) {
  return (
    (is(hebrew, month, day) && weekday !== SATURDAY) ||
    (is(hebrew, month, day + 1) && weekday === SUNDAY)
  );
}

/**
 * Yom HaAtzmaut: 5 Iyar, moved to Thursday if it falls on Friday or Shabbat,
 * and to Tuesday if it falls on Monday (so that Yom HaZikaron is not on Sunday).
 * @param {Date} date
 */
function isYomHaAtzmaut(date) {
  const hebrew = toHebrewDate(date);
  const weekday = date.getDay();
  return (
    (is(hebrew, "Iyar", 5) && ![MONDAY, FRIDAY, SATURDAY].includes(weekday)) ||
    (is(hebrew, "Iyar", 4) && weekday === THURSDAY) ||
    (is(hebrew, "Iyar", 3) && weekday === THURSDAY) ||
    (is(hebrew, "Iyar", 6) && weekday === TUESDAY)
  );
}

/**
 * Yom HaShoah: 27 Nisan, moved to Thursday if it falls on Friday
 * and to Monday if it falls on Sunday.
 * @param {{ month: string, day: number }} hebrew
 * @param {number} weekday
 */
function isYomHaShoah(hebrew, weekday) {
  return (
    (is(hebrew, "Nisan", 27) && ![FRIDAY, SUNDAY].includes(weekday)) ||
    (is(hebrew, "Nisan", 26) && weekday === THURSDAY) ||
    (is(hebrew, "Nisan", 28) && weekday === MONDAY)
  );
}

/**
 * Lists the holidays that fall on a local date.
 * @param {Date} date - Local date.
 * @returns {Holiday[]} Empty if the date is a regular day.
 */
export function holidaysOn(date) {
  const hebrew = toHebrewDate(date);
  const weekday = date.getDay();
  const found = [];
  const add = (name, kind) => found.push({ name, kind });

  for (const [month, day, name, kind] of FIXED) {
    if (is(hebrew, month, day)) add(name, kind);
  }

  for (const [month, first, last, name, kind] of RANGES) {
    if (hebrew.month === month && hebrew.day >= first && hebrew.day <= last) add(name, kind);
  }

  const hanukkah = hanukkahDay(date);
  if (hanukkah) add(`Hanukkah, day ${hanukkah}`, "festive");

  if (isPostponedFast(hebrew, weekday, "Tishri", 3)) add("Tzom Gedaliah", "memorial");
  if (isPostponedFast(hebrew, weekday, "Tamuz", 17)) add("17 Tammuz", "memorial");
  if (isPostponedFast(hebrew, weekday, "Av", 9)) add("Tisha B'Av", "memorial");

  if (
    (is(hebrew, "Adar", 13) && weekday !== SATURDAY) ||
    (is(hebrew, "Adar", 11) && weekday === THURSDAY)
  ) {
    add("Ta'anit Esther", "memorial");
  }

  if (isYomHaShoah(hebrew, weekday)) add("Yom HaShoah", "memorial");
  if (isYomHaAtzmaut(addDays(date, 1))) add("Yom HaZikaron", "memorial");
  if (isYomHaAtzmaut(date)) add("Yom HaAtzmaut", "holiday");

  return found;
}

/**
 * Picks the most important kind among the holidays of a day.
 * @param {Holiday[]} holidays
 * @returns {HolidayKind | null} Null if there are no holidays.
 */
export function mainKind(holidays) {
  return KIND_PRIORITY.find((kind) => holidays.some((holiday) => holiday.kind === kind)) ?? null;
}
