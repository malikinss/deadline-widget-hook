// ./src/notion/properties.ts

import type { NotionDate, NotionPage } from "./types";

export function getDate(page: NotionPage, name: string): NotionDate | null {
  return page.properties[name]?.date ?? null;
}

export function getStatusName(page: NotionPage, name: string): string | null {
  return page.properties[name]?.status?.name ?? null;
}