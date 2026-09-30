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
// What the worker should write for an active task: our countdown page with the deadline.
const EXPECTED = `${WORKER}/countdown?to=2026-10-02T09%3A00`;
const DONE = `${WORKER}/done`;
const PENDING = `${WORKER}/pending`;

// Embeds that may already exist on a page.
const OLD_COUNTDOWN = `${WORKER}/countdown?to=2026-09-01T12%3A00`;

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
    it("show the pending badge when there is no deadline", async () => {
      const notion = fakeNotion({ deadline: null, blocks: [embedBlock(EXPECTED)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", PENDING);
    });

    it("replace the done badge after being reopened without a deadline", async () => {
      const notion = fakeNotion({ deadline: null, blocks: [embedBlock(DONE)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", PENDING);
    });

    it("leave the embed alone when the url is the same", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(EXPECTED)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "unchanged", blockId: "b1" });
      expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
    });

    it("update the countdown when the deadline changed", async () => {
      const notion = fakeNotion({ blocks: [embedBlock(OLD_COUNTDOWN)] });
      const result = await syncWidgetEmbed(notion, "p1");

      expect(result).toEqual({ status: "updated", blockId: "b1" });
      expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
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
