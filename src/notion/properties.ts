// ./src/notion/properties.ts

import type { NotionPage } from "./types";

export function getFormulaString(page: NotionPage, name: string): string | null {
  const value = page.properties[name]?.formula?.string;
  return value ? value : null;
}

export function getDateStart(page: NotionPage, name: string): string | null {
  return page.properties[name]?.date?.start ?? null;
}