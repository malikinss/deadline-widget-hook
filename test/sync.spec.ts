// ./test/sync.spec.ts

import { describe, expect, it, vi } from "vitest";
import type { NotionClient } from "../src/notion/client";
import type { NotionBlock } from "../src/notion/types";
import { syncWidgetEmbed } from "../src/widget/sync";

// Formula evaluated via the API returns time in UTC, so the template deliberately
// contains a wrong "to" value that the worker must replace with the wall-clock time.
const TEMPLATE =
  "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-10-02T06%3A00&theme=light";
const DEADLINE = "2026-10-02T09:00:00.000+03:00";
const EXPECTED =
  "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-10-02T09%3A00&theme=light";
const OLD_URL =
  "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-09-01T12%3A00&theme=light";

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

describe("syncWidgetEmbed", () => {
  it("skips when formula is empty", async () => {
    const notion = fakeNotion({ widgetUrl: null });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result.status).toBe("skipped");
    expect(notion.appendEmbed).not.toHaveBeenCalled();
  });

  it("skips when deadline is empty", async () => {
    const notion = fakeNotion({ deadline: null });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result.status).toBe("skipped");
    expect(notion.appendEmbed).not.toHaveBeenCalled();
  });

  it("creates embed with wall-clock deadline", async () => {
    const notion = fakeNotion();
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "created" });
    expect(notion.appendEmbed).toHaveBeenCalledWith("p1", EXPECTED);
  });

  it("does not write when url is the same", async () => {
    const notion = fakeNotion({ blocks: [{ id: "b1", type: "embed", embed: { url: EXPECTED } }] });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "unchanged", blockId: "b1" });
    expect(notion.updateEmbedUrl).not.toHaveBeenCalled();
  });

  it("updates embed when url changed", async () => {
    const notion = fakeNotion({ blocks: [{ id: "b1", type: "embed", embed: { url: OLD_URL } }] });
    const result = await syncWidgetEmbed(notion, "p1");

    expect(result).toEqual({ status: "updated", blockId: "b1" });
    expect(notion.updateEmbedUrl).toHaveBeenCalledWith("b1", EXPECTED);
  });
});
