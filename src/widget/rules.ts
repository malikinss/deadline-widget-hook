// ./src/widget/rules.ts

import { DATABASES, DEFAULT_DEADLINE_TIME, type DatabaseConfig } from "../config";
import { toWallClock } from "../lib/datetime";
import { normalizeId } from "../notion/ids";
import { getDate, getStatusName } from "../notion/properties";
import type { NotionPage } from "../notion/types";

/**
 * Finds the config of the database the page belongs to.
 * @returns Database config, or null if the page is outside the allowed databases.
 */
export function findDatabaseConfig(page: NotionPage): DatabaseConfig | null {
  const id = page.parent.database_id;
  return id ? (DATABASES[normalizeId(id)] ?? null) : null;
}

/**
 * Checks whether the page status means the item is finished.
 */
export function isCompleted(page: NotionPage, db: DatabaseConfig): boolean {
  if (!db.statusProperty) return false;
  const status = getStatusName(page, db.statusProperty);
  return status !== null && db.completedStatuses.includes(status);
}

/**
 * Reads the deadline as wall-clock time.
 * Uses the end of a date range if present, and the default time for dates without time.
 * @returns Deadline in `YYYY-MM-DDTHH:mm` format, or null if the property is empty.
 */
export function readDeadline(page: NotionPage, db: DatabaseConfig): string | null {
  const date = getDate(page, db.deadlineProperty);
  const iso = date?.end ?? date?.start;
  return iso ? toWallClock(iso, DEFAULT_DEADLINE_TIME) : null;
}