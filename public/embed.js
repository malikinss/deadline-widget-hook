// ./public/embed.js

/**
 * Widget wrapper: reads the widget URL from the `src` query parameter
 * and loads it with a theme matching the system color scheme.
 * The URL is validated by the worker before this page is served.
 */

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
 * Loads the widget with a theme that matches the current system color scheme.
 * @param {HTMLIFrameElement} frame - Iframe that displays the widget.
 * @param {URL} widgetUrl - Widget URL.
 * @param {MediaQueryList} darkQuery - Result of the `prefers-color-scheme: dark` query.
 */
function applyTheme(frame, widgetUrl, darkQuery) {
  widgetUrl.searchParams.set("theme", darkQuery.matches ? "dark" : "light");
  const next = widgetUrl.toString();
  if (frame.src !== next) frame.src = next;
}

function main() {
  const frame = document.getElementById("widget");
  const widgetUrl = readWidgetUrl();

  if (!widgetUrl) {
    document.body.textContent = "Invalid widget URL";
    return;
  }

  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  applyTheme(frame, widgetUrl, darkQuery);
  darkQuery.addEventListener("change", () => applyTheme(frame, widgetUrl, darkQuery));
}

main();