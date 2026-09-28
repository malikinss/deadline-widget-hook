// ./test/embed.spec.ts

import { describe, expect, it, vi } from "vitest";
import { handleEmbed } from "../src/embed/handler";
import type { Env } from "../src/env";

const WIDGET = "https://mindfulwidgets.com/embed/x?to=2026-10-06T09%3A00";

/**
 * Creates an Env whose ASSETS binding returns a stub page instead of real files.
 */
function fakeEnv() {
  const assetsFetch = vi.fn(async () => new Response("wrapper page"));
  const env = {
    NOTION_TOKEN: "",
    HOOK_SECRET: "",
    ASSETS: { fetch: assetsFetch } as unknown as Fetcher,
  } satisfies Env;
  return { env, assetsFetch };
}

function embedRequest(src?: string): Request {
  const url = new URL("https://worker.test/embed");
  if (src !== undefined) url.searchParams.set("src", src);
  return new Request(url);
}

describe("handleEmbed", () => {
  it("serves the wrapper page for a valid widget url", async () => {
    const { env, assetsFetch } = fakeEnv();
    const res = await handleEmbed(embedRequest(WIDGET), env);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("wrapper page");
    expect(assetsFetch).toHaveBeenCalledOnce();
  });

  it("rejects a missing src", async () => {
    const { env, assetsFetch } = fakeEnv();
    const res = await handleEmbed(embedRequest(), env);

    expect(res.status).toBe(400);
    expect(assetsFetch).not.toHaveBeenCalled();
  });

  it("rejects a foreign host", async () => {
    const { env, assetsFetch } = fakeEnv();
    const res = await handleEmbed(embedRequest("https://example.com"), env);

    expect(res.status).toBe(400);
    expect(assetsFetch).not.toHaveBeenCalled();
  });
});
