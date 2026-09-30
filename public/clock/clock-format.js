// ./public/clock-format.js

/**
 * Formatting helpers for the clock widget.
 */

import { pad2 } from "../shared/time.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}