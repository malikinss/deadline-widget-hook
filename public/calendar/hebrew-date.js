// ./public/calendar/hebrew-date.js

/**
 * Conversion from Gregorian dates to the Hebrew calendar,
 * using the browser's built-in Intl support.
 */

const formatter = new Intl.DateTimeFormat("en-u-ca-hebrew", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Month names as returned by Intl, mapped to the keys used by the holiday rules.
// In a leap year Intl returns "Adar I" and "Adar II"; the holidays of Adar
// fall in Adar II, so it is treated as "Adar".
const MONTH_KEYS = {
  Tishri: "Tishri",
  Heshvan: "Heshvan",
  Kislev: "Kislev",
  Tevet: "Tevet",
  Shevat: "Shevat",
  "Adar I": "Adar I",
  Adar: "Adar",
  "Adar II": "Adar",
  Nisan: "Nisan",
  Iyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tamuz",
  Av: "Av",
  Elul: "Elul",
};

/**
 * Converts a local date to the Hebrew calendar.
 * @param {Date} date - Local date.
 * @returns {{ year: number, month: string, day: number }} For example
 * `{ year: 5787, month: "Tishri", day: 10 }`.
 * @throws {Error} If Intl returns a month name that is not known.
 */
export function toHebrewDate(date) {
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  const month = MONTH_KEYS[parts.month];
  if (!month) throw new Error(`Unknown Hebrew month: ${parts.month}`);

  return { year: Number(parts.year), month, day: Number(parts.day) };
}