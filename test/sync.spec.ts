import { describe, expect, it, vi } from "vitest";
import type { NotionClient } from "../src/notion/client";
import type { NotionBlock } from "../src/notion/types";
import { syncWidgetEmbed } from "../src/widget/sync";

const WORKER = "https://deadline-widget-hook.arme-malikinss.workers.dev";

// Formula evaluated via the API returns time in UTC, so the template deliberately
// contains a wrong "to" value that the worker must replace with the wall-clock time.
const TEMPLATE =
  "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-10-02T06%3A00&theme=light";
const DEADLINE = "2026-10-02T09:00:00.000+03:00";

// What the worker should write: the fixed widget URL wrapped into the embed page.
const EXPECTED =
  `${WORKER}/embed?src=https%3A%2F%2Fmindfulwidgets.com%2Fembed%2Fx%3Flabel%3DDeadline%26to%3D2026-10-02T09%253A00%26theme%3Dlight`;

// Embeds that may already exist on a page.
const LEGACY_DIRECT =
  "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-09-01T12%3A00&theme=light";
const OLD_WRAPPED =
  `${WORKER}/embed?src=https%3A%2F%2Fmindfulwidgets.com%2Fembed%2Fx%3Flabel%3DDeadline%26to%3D2026-09-01T12%253A00%26theme%3Dlight`;

interface FakeOptions {
  widgetUrl?: string | null;
  deadline?: string | null;
  blocks?: NotionBlock[];
}

/**
 * Creates an in-memory NotionClient with recorded calls.
 * Defaults describe a valid page; pass `null` to simulate an empty property.
 */
function fakeNotion({ widgetUrl = TEMPLATE, deadline = DEADLINE, blocks = [] }: FakeOptions = {}) {
  return {
    getPage: vi.fn(async (id: string) => ({
      id,
      properties: {
        "Widget URL": { type: "formula", formula: { type: "string", string: widgetUrl } },
        Deadline: {
          type: "date",
          date: deadline ? { start: deadline, end: null, time_zone: null } : null,
        },
      },
    })),
    listChildren: vi.fn(async () => blocks),
    updateEmbedUrl: vi.fn(async () => {}),
    appendEmbed: vi.fn(async () => {}),
  } satisfies NotionClient;
}

function embedBlock(url: string): NotionBlock {
  return { id: "b1", type: "embed", embed: { url } };
}

describe("syncWidgetEmbed", () => {
  it("skips when deadline is empty", async () => {
    const notion = fakeNotion({ deadline: null });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result.status).toBe("skipped");
    expect(notion.appendEmbed).not.toHaveBeenCalled();
  });

  it("skips when formula is empty", async () => {
    const notion = fakeNotion({ widgetUrl: null });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result.status).toBe("skipped");
    expect(notion.appendEmbed).not.toHaveBeenCalled();
  });

  it("creates a wrapped embed when page has none", async () => {
    const notion = fakeNotion();
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "created" });
    expect(notion.appendEmbed).toHaveBeenCalledWith("p1", EXPECTED);
  });

  it("does not write when the wrapped url is the same", async () => {
    const notion = fakeNotion({ blocks: [embedBlock(EXPECTED)] });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "unchanged", blockId: "b1" });
    expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
  });

  it("updates a wrapped embed when the deadline changed", async () => {
    const notion = fakeNotion({ blocks: [embedBlock(OLD_WRAPPED)] });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "updated", blockId: "b1" });
    expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
  });

  it("converts a legacy direct embed into a wrapped one", async () => {
    const notion = fakeNotion({ blocks: [embedBlock(LEGACY_DIRECT)] });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "updated", blockId: "b1" });
    expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
    expect(notion.appendEmbed).not.toHaveBeenCalled();
  });
});