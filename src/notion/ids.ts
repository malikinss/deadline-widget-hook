// ./src/notion/ids.ts

/**
 * Normalizes a Notion ID to 32 lowercase hex characters without dashes,
 * so IDs from links and from the API can be compared directly.
 * @example
 * normalizeId("397E539B-924B-80B2-872A-DF70D28B9C58"); // "397e539b924b80b2872adf70d28b9c58"
 */
export function normalizeId(id: string): string {
  return id.replace(/-/g, "").toLowerCase();
}