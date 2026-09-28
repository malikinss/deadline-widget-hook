import type { Env } from "./env";
import { HttpError, json } from "./http";
import { createNotionClient } from "./notion/client";
import { NotionApiError } from "./notion/errors";
import { isAuthorized } from "./webhook/auth";
import { parsePageId } from "./webhook/payload";
import { syncWidgetEmbed } from "./widget/sync";

export default {
  async fetch(req, env): Promise<Response> {
    if (req.method !== "POST") return new Response("ok");
    if (!isAuthorized(req, env.HOOK_SECRET)) {
      return json({ error: "forbidden" }, 403);
    }

    try {
      const pageId = await parsePageId(req);
      const notion = createNotionClient(env.NOTION_TOKEN);
      const result = await syncWidgetEmbed(notion, pageId);

      console.log(JSON.stringify({ pageId, ...result }));
      return json(result);
    } catch (err) {
      return errorResponse(err);
    }
  },
} satisfies ExportedHandler<Env>;

function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return json({ error: err.message }, err.status);
  }
  if (err instanceof NotionApiError) {
    console.error(`Notion API ${err.status} ${err.code}: ${err.message}`);
    return json({ error: "notion_api_error", code: err.code }, 502);
  }
  console.error(err);
  return json({ error: "internal_error" }, 500);
}