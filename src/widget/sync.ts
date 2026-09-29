// ./src/widget/sync.ts

import { findEmbed } from "../notion/blocks";
import type { NotionClient } from "../notion/client";
import { findDatabaseConfig, isCompleted, readDeadline } from "./rules";
import { buildWidgetUrl, doneUrl, isManagedEmbedUrl, toEmbedUrl } from "./widget";

export type SyncResult =
  | { status: "updated"; blockId: string }
  | { status: "unchanged"; blockId: string }
  | { status: "skipped"; reason: string };

export async function syncWidgetEmbed(
  notion: NotionClient,
  pageId: string,
): Promise<SyncResult> {
  const page = await notion.getPage(pageId);

  const db = findDatabaseConfig(page);
  if (!db) {
    return { status: "skipped", reason: "database is not configured" };
  }

  const completed = isCompleted(page, db);

  let target: string;
  if (completed) {
    target = doneUrl();
  } else {
    const deadline = readDeadline(page, db);
    if (!deadline) {
      return { status: "skipped", reason: `empty "${db.deadlineProperty}"` };
    }
    target = toEmbedUrl(buildWidgetUrl(deadline));
  }

  const embed = findEmbed(await notion.listChildren(pageId), isManagedEmbedUrl);

  if (!embed) {
    return { status: "skipped", reason: "no widget on page" };
  }

  if (embed.embed.url === target) {
    return { status: "unchanged", blockId: embed.id };
  }

  await notion.updateEmbedUrl(embed.id, target);
  return { status: "updated", blockId: embed.id };
}
