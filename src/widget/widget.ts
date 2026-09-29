// ./src/widget/widget.ts

import {
  EMBED_PATH,
  EMBED_SRC_PARAM,
  WIDGET_DEADLINE_PARAM,
  WIDGET_HOST,
  WORKER_ORIGIN,
} from "../config";

export function isWidgetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === WIDGET_HOST;
  } catch {
    return false;
  }
}

export function withDeadline(widgetUrl: string, wallClock: string): string {
  const url = new URL(widgetUrl);
  url.searchParams.set(WIDGET_DEADLINE_PARAM, wallClock);
  return url.toString();
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
 * Checks whether a URL points to our embed wrapper page.
 */
export function isEmbedWrapperUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === WORKER_ORIGIN && parsed.pathname === EMBED_PATH;
  } catch {
    return false;
  }
}

/**
 * Checks whether an embed is managed by the sync:
 * either a legacy direct widget URL or a wrapper URL.
 */
export function isManagedEmbedUrl(url: string): boolean {
  return isWidgetUrl(url) || isEmbedWrapperUrl(url);
}