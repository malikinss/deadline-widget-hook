// ./public/clock/clock-format.js

/**
 * Formatting helpers for the clock widget.
 */

import { pad2 } from "../shared/time.js";
import { MONTHS_SHORT, WEEKDAYS_SHORT } from "../shared/date-names.js";


/**
 * Splits a moment into two-digit hours, minutes and seconds in local time.
 * @param {Date} date - Moment to show.
 * @returns {{ hours: string, minutes: string, seconds: string }}
 */
export function clockParts(date) {
  return {
    hours: pad2(date.getHours()),
    minutes: pad2(date.getMinutes()),
    seconds: pad2(date.getSeconds()),
  };
}

/**
 * Formats the weekday and date in local time.
 * @param {Date} date - Moment to show.
 * @returns {string} For example `"Wed, Sep 30"`.
 */
export function dateLabel(date) {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}