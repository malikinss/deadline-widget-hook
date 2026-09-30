// ./src/widget/widget.ts

import {
  COUNTDOWN_DEADLINE_PARAM,
  COUNTDOWN_PATH,
  DONE_PATH,
  PENDING_PATH,
  WORKER_ORIGIN,
} from "../config";

// Worker pages that can be shown in a widget embed.
const MANAGED_PATHS = [COUNTDOWN_PATH, DONE_PATH, PENDING_PATH];

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
 * Builds the URL of our countdown widget page.
 * @param wallClock - Deadline in `YYYY-MM-DDTHH:mm` format.
 */
export function countdownUrl(wallClock: string): string {
  const url = new URL(COUNTDOWN_PATH, WORKER_ORIGIN);
  url.searchParams.set(COUNTDOWN_DEADLINE_PARAM, wallClock);
  return url.toString();
}

/**
 * Returns the URL of the "Completed" badge page.
 */
export function doneUrl(): string {
  return new URL(DONE_PATH, WORKER_ORIGIN).toString();
}

/**
 * Returns the URL of the "No deadline" badge page.
 */
export function pendingUrl(): string {
  return new URL(PENDING_PATH, WORKER_ORIGIN).toString();
}

/**
 * Checks whether an embed is managed by the sync:
 * it points to the countdown or one of the badge pages.
 */
export function isManagedEmbedUrl(url: string): boolean {
  return MANAGED_PATHS.some((path) => isWorkerPageUrl(url, path));
}
