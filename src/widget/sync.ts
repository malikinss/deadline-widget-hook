// ./src/widget/sync.ts

import { DEADLINE_PROPERTY, WIDGET_URL_PROPERTY } from "../config";
import { toWallClock } from "../lib/datetime";
import { findEmbed } from "../notion/blocks";
import type { NotionClient } from "../notion/client";
import { getDateStart, getFormulaString } from "../notion/properties";
import { isManagedEmbedUrl, toEmbedUrl, withDeadline } from "./widget";

export type SyncResult =
  | { status: "created" }
  | { status: "updated"; blockId: string }
  | { status: "unchanged"; blockId: string }
  | { status: "skipped"; reason: string };

export async function syncWidgetEmbed(
  notion: NotionClient,
  pageId: string,
): Promise<SyncResult> {
  const page = await notion.getPage(pageId);

  const deadline = getDateStart(page, DEADLINE_PROPERTY);
  if (!deadline) {
    return { status: "skipped", reason: `empty "${DEADLINE_PROPERTY}"` };
  }

  const template = getFormulaString(page, WIDGET_URL_PROPERTY);
  if (!template) {
    return { status: "skipped", reason: `empty "${WIDGET_URL_PROPERTY}"` };
  }

  const url = toEmbedUrl(withDeadline(template, toWallClock(deadline)));
  const embed = findEmbed(await notion.listChildren(pageId), isManagedEmbedUrl);

  if (!embed) {
    await notion.appendEmbed(pageId, url);
    return { status: "created" };
  }

  if (embed.embed.url === url) {
    return { status: "unchanged", blockId: embed.id };
  }

  await notion.updateEmbedUrl(embed.id, url);
  return { status: "updated", blockId: embed.id };
}
