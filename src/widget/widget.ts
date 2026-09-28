// ./src/widget/widget.ts

import { WIDGET_DEADLINE_PARAM, WIDGET_HOST } from "../config";

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