import type { DatabaseConfig } from "../config";
import { findEmbed } from "../notion/blocks";
import type { NotionClient } from "../notion/client";
import type { NotionPage } from "../notion/types";
import { findDatabaseConfig, isCompleted, readDeadline } from "./rules";
import { countdownUrl, doneUrl, isManagedEmbedUrl, pendingUrl } from "./widget";

export type SyncResult =
  | { status: "updated"; blockId: string }
  | { status: "unchanged"; blockId: string }
  | { status: "skipped"; reason: string };

/**
 * Decides which URL the widget embed should show for the page's current state.
 */
function targetUrl(page: NotionPage, db: DatabaseConfig): string {
  if (isCompleted(page, db)) return doneUrl();

  const deadline = readDeadline(page, db);
  return deadline ? countdownUrl(deadline) : pendingUrl();
}

export async function syncWidgetEmbed(
  notion: NotionClient,
  pageId: string,
): Promise<SyncResult> {
  const page = await notion.getPage(pageId);

  const db = findDatabaseConfig(page);
  if (!db) {
    return { status: "skipped", reason: "database is not configured" };
  }

  const embed = findEmbed(await notion.listChildren(pageId), isManagedEmbedUrl);
  if (!embed) {
    return { status: "skipped", reason: "no widget on page" };
  }

  const target = targetUrl(page, db);
  if (embed.embed.url === target) {
    return { status: "unchanged", blockId: embed.id };
  }

  await notion.updateEmbedUrl(embed.id, target);
  return { status: "updated", blockId: embed.id };
}
