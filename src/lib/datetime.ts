/* ./src/lib/datetime.ts

/**
 * Extracts wall-clock date and time from an ISO 8601 string
 * without converting it to another time zone.
 *
 * @param iso - ISO 8601 date or date-time, e.g. a Notion `date.start` value.
 * @param defaultTime - Time in `HH:mm` format used when `iso` has no time part.
 * @returns Local date-time in `YYYY-MM-DDTHH:mm` format.
 *
 * @example
 * toWallClock("2026-10-02T09:00:00.000+03:00"); // "2026-10-02T09:00"
 * toWallClock("2026-10-02");                    // "2026-10-02T00:00"
 * toWallClock("2026-10-02", "12:00");           // "2026-10-02T12:00"
 */
export function toWallClock(iso: string, defaultTime = "00:00"): string {
  return iso.includes("T") ? iso.slice(0, 16) : `${iso}T${defaultTime}`;
}