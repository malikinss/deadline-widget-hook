// ./src/widget/widget.ts

import {
  DONE_PATH,
  EMBED_PATH,
  EMBED_SRC_PARAM,
  WIDGET_BASE_URL,
  WIDGET_DEADLINE_PARAM,
  WIDGET_HOST,
  WIDGET_PARAMS,
  WORKER_ORIGIN,
  PENDING_PATH,
  COUNTDOWN_DEADLINE_PARAM,
  COUNTDOWN_PATH
} from "../config";

/**
 * Returns the URL of the "Completed" badge page.
 */
export function doneUrl(): string {
  return new URL(DONE_PATH, WORKER_ORIGIN).toString();
}

/**
 * Builds the countdown widget URL from the template in config.
 * @param wallClock - Deadline in `YYYY-MM-DDTHH:mm` format.
 * @returns Direct widget URL.
 */
export function buildWidgetUrl(wallClock: string): string {
  const url = new URL(WIDGET_BASE_URL);
  for (const [name, value] of Object.entries(WIDGET_PARAMS)) {
    url.searchParams.set(name, value);
  }
  url.searchParams.set(WIDGET_DEADLINE_PARAM, wallClock);
  return url.toString();
}

export function isWidgetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === WIDGET_HOST;
  } catch {
    return false;
  }
}

/**
 * Wraps a widget URL into the theme-aware embed wrapper URL.
 * @param widgetUrl - Direct widget URL.
 * @returns Wrapper URL with the widget URL in the `src` parameter.
 */
export function toEmbedUrl(widgetUrl: string): string {
  const url = new URL(EMBED_PATH, WORKER_ORIGIN);
  url.searchParams.set(EMBED_SRC_PARAM, widgetUrl);
  return url.toString();
}

/**
 * Checks whether a URL points to a given page of this worker.
 */
function isWorkerPageUrl(url: string, path: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === WORKER_ORIGIN && parsed.pathname === path;
  } catch {
    return false;
  }
}

/**
 * Checks whether a URL points to our embed wrapper page.
 */
export function isEmbedWrapperUrl(url: string): boolean {
  return isWorkerPageUrl(url, EMBED_PATH);
}

/**
 * Checks whether a URL points to our "Completed" badge page.
 */
export function isDonePageUrl(url: string): boolean {
  return isWorkerPageUrl(url, DONE_PATH);
}

/**
 * Returns the URL of the "No deadline" badge page.
 */
export function pendingUrl(): string {
  return new URL(PENDING_PATH, WORKER_ORIGIN).toString();
}

/**
 * Checks whether a URL points to our "No deadline" badge page.
 */
export function isPendingPageUrl(url: string): boolean {
  return isWorkerPageUrl(url, PENDING_PATH);
}

/**
 * Builds the URL of our countdown widget page.
 * @param wallClock - Deadline in `YYYY-MM-DDTHH:mm` format.
 */
export function countdownUrl(wallClock: string): string {
  const url = new URL(COUNTDOWN_PATH, WORKER_ORIGIN);
  url.searchParams.set(COUNTDOWN_DEADLINE_PARAM, wallClock);
  return url.toString();
}

/**
 * Checks whether a URL points to our countdown widget page.
 */
export function isCountdownPageUrl(url: string): boolean {
  return isWorkerPageUrl(url, COUNTDOWN_PATH);
}

/**
 * Checks whether an embed is managed by the sync: a legacy direct widget URL,
 * a wrapper URL or one of the badge pages.
 */
export function isManagedEmbedUrl(url: string): boolean {
  return (
    isWidgetUrl(url) ||
    isEmbedWrapperUrl(url) ||
    isCountdownPageUrl(url) ||
    isDonePageUrl(url) ||
    isPendingPageUrl(url)
  );
}
