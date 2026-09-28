// ./src/embed/handler.ts

import { EMBED_SRC_PARAM } from "../config";
import type { Env } from "../env";
import { isWidgetUrl } from "../widget/widget";

/**
 * Serves the widget wrapper page after validating its `src` parameter.
 * Invalid or missing widget URLs are rejected with 400.
 */
export async function handleEmbed(req: Request, env: Env): Promise<Response> {
  const src = new URL(req.url).searchParams.get(EMBED_SRC_PARAM);

  if (!src || !isWidgetUrl(src)) {
    return new Response("Invalid widget URL", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return env.ASSETS.fetch(req);
}

