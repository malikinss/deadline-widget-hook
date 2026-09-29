// ./test/sync.spec.ts

import { describe, expect, it, vi } from "vitest";
import type { NotionClient } from "../src/notion/client";
import type { NotionBlock } from "../src/notion/types";
import { syncWidgetEmbed } from "../src/widget/sync";

const WORKER = "https://deadline-widget-hook.arme-malikinss.workers.dev";
const TASKS_API_ID = "397e539b-924b-80b2-872a-df70d28b9c58";

const IN_PROGRESS = "בביצוע - In process";
const COMPLETED = "הושלם - Completed";
const DEADLINE = "2026-10-02T09:00:00.000+03:00";

// What the worker should write for an active task: the widget URL built from config, wrapped.
const EXPECTED =
  `${WORKER}/embed?src=https%3A%2F%2Fmindfulwidgets.com%2Fembed%2Fnotion%2Fcountdown%2Fv1` +
  "%3Fcolor%3Dgray%26ink%3D24a9e1%26font%3Dsans%26style%3Dflip%26label%3DDeadline" +
  "%26to%3D2026-10-02T09%253A00";
const DONE = `${WORKER}/done`;

// Embeds that may already exist on a page.
const LEGACY_DIRECT =
  "https://mindfulwidgets.com/embed/notion/countdown/v1" +
  "?color=gray&ink=24a9e1&font=sans&style=flip&label=Deadline&to=2026-09-01T12%3A00&theme=light";
const OLD_WRAPPED =
  `${WORKER}/embed?src=https%3A%2F%2Fmindfulwidgets.com%2Fembed%2Fnotion%2Fcountdown%2Fv1` +
  "%3Fcolor%3Dgray%26ink%3D24a9e1%26font%3Dsans%26style%3Dflip%26label%3DDeadline" +
  "%26to%3D2026-09-01T12%253A00";

interface FakeOptions {
  databaseId?: string;
  deadline?: string | null;
  status?: string | null;
  blocks?: NotionBlock[];
}

/**
 * Creates an in-memory NotionClient with recorded calls.
 * Defaults describe an active task with a deadline; pass `null` to simulate an empty property.
 */
function fakeNotion({
  databaseId = TASKS_API_ID,
  deadline = DEADLINE,
  status = IN_PROGRESS,
  blocks = [],
}: FakeOptions = {}) {
  return {
    getPage: vi.fn(async (id: string) => ({
      id,
      parent: { type: "database_id", database_id: databaseId },
      properties: {
        Deadline: {
          type: "date",
          date: deadline ? { start: deadline, end: null, time_zone: null } : null,
        },
        Status: { type: "status", status: status ? { name: status } : null },
      },
    })),
    listChildren: vi.fn(async () => blocks),
    updateEmbedUrl: vi.fn(async () => {}),
  } satisfies NotionClient;
}

function embedBlock(url: string): NotionBlock {
  return { id: "b1", type: "embed", embed: { url } };
}

describe("syncWidgetEmbed", () => {
  describe("skips", () => {
    it("pages from databases that are not configured", async () => {
      const notion = fakeNotion({ databaseId: "00000000-0000-0000-0000-000000000000" });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "skipped", reason: "database is not configured" });
      expect(notion.listChildren).not.toHaveBeenCalled();
    });

    it("active pages without a deadline", async () => {
      const notion = fakeNotion({ deadline: null });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result.status).toBe("skipped");
      expect(notion.listChildren).not.toHaveBeenCalled();
    });

    it("active pages without a widget", async () => {
      const notion = fakeNotion();
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "skipped", reason: "no widget on page" });
      expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
    });

    it("completed pages without a widget", async () => {
      const notion = fakeNotion({ status: COMPLETED });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "skipped", reason: "no widget on page" });
      expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
    });
  });

  describe("active pages", () => {
    it("leave the embed alone when the url is the same", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(EXPECTED)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "unchanged", blockId: "b1" });
      expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
    });

    it("update a wrapped embed when the deadline changed", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(OLD_WRAPPED)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
    });

    it("convert a legacy direct embed", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(LEGACY_DIRECT)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
    });

    it("restore the countdown after being reopened", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(DONE)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
    });
  });

  describe("completed pages", () => {
    it("replace the countdown with the badge", async () => {
      const notion = fakeNotion({ status: COMPLETED, blocks: [embedBlock(EXPECTED)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", DONE);
    });

    it("leave the badge alone", async () => {
      const notion = fakeNotion({ status: COMPLETED, blocks: [embedBlock(DONE)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "unchanged", blockId: "b1" });
      expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
    });
  });
});
