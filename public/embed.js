// ./public/embed.js

/**
 * Widget wrapper: reads the widget URL from the `src` query parameter,
 * sets its theme from the system color scheme and its ink color
 * from the time left until the deadline.
 * The URL is validated by the worker before this page is served.
 */

import { msUntilNextChange, parseDeadline, pickInk } from "./urgency.js";

// Longest delay setTimeout supports (about 24.8 days); longer values fire immediately.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Parses the widget URL from the page query string.
 * @returns {URL | null} Widget URL, or null if it cannot be parsed.
 */
function readWidgetUrl() {
  try {
    return new URL(new URLSearchParams(location.search).get("src") ?? "");
  } catch {
    return null;
  }
}

/**
 * Builds the widget URL for the current theme and time.
 * @param {URL} baseUrl - Widget URL from the `src` parameter.
 * @param {boolean} isDark - Whether the system color scheme is dark.
 * @param {number} now - Current timestamp in milliseconds.
 * @returns {string} Widget URL to load.
 */
function buildWidgetUrl(baseUrl, isDark, now) {
  const url = new URL(baseUrl);
  url.searchParams.set("theme", isDark ? "dark" : "light");

  const deadline = parseDeadline(url);
  if (deadline !== null) {
    const ink = pickInk(deadline - now);
    if (ink) url.searchParams.set("ink", ink);
  }

  return url.toString();
}

function main() {
  const frame = document.getElementById("widget");
  const baseUrl = readWidgetUrl();

  if (!baseUrl) {
    document.body.textContent = "Invalid widget URL";
    return;
  }

  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  const deadline = parseDeadline(baseUrl);
  let timer = null;

  const scheduleNext = (now) => {
    clearTimeout(timer);
    if (deadline === null) return;
    const wait = msUntilNextChange(deadline - now);
    if (wait !== null) timer = setTimeout(render, Math.min(wait, MAX_TIMEOUT_MS));
  };

  const render = () => {
    const now = Date.now();
    const next = buildWidgetUrl(baseUrl, darkQuery.matches, now);
    if (frame.src !== next) frame.src = next;
    scheduleNext(now);
  };

  render();
  darkQuery.addEventListener("change", render);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
}

main();