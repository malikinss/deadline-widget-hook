import { NOTION_API_BASE, NOTION_VERSION } from "../config";
import { NotionApiError } from "./errors";
import type { NotionBlock, NotionList, NotionPage } from "./types";

export interface NotionClient {
  getPage(pageId: string): Promise<NotionPage>;
  listChildren(blockId: string): Promise<NotionBlock[]>;
  updateEmbedUrl(blockId: string, url: string): Promise<void>;
  appendEmbed(parentId: string, url: string): Promise<void>;
}

export function createNotionClient(token: string): NotionClient {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${NOTION_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res
        .json<{ code?: string; message?: string }>()
        .catch((): { code?: string; message?: string } => ({}));
      throw new NotionApiError(
        res.status,
        body.code ?? "unknown",
        body.message ?? res.statusText,
      );
    }

    return res.json<T>();
  }

  return {
    getPage(pageId) {
      return request<NotionPage>(`/pages/${pageId}`);
    },

    async listChildren(blockId) {
      const blocks: NotionBlock[] = [];
      let cursor: string | null = null;

      do {
        const query = new URLSearchParams({ page_size: "100" });
        if (cursor) query.set("start_cursor", cursor);

        const page = await request<NotionList<NotionBlock>>(
          `/blocks/${blockId}/children?${query}`,
        );
        blocks.push(...page.results);
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor);

      return blocks;
    },

    async updateEmbedUrl(blockId, url) {
      await request(`/blocks/${blockId}`, {
        method: "PATCH",
        body: JSON.stringify({ embed: { url } }),
      });
    },

    async appendEmbed(parentId, url) {
      await request(`/blocks/${parentId}/children`, {
        method: "PATCH",
        body: JSON.stringify({ children: [{ type: "embed", embed: { url } }] }),
      });
    },
  };
}
