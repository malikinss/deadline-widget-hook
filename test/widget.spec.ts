// ./test/widget.spec.ts

import { describe, expect, it } from "vitest";
import { countdownUrl, doneUrl, isManagedEmbedUrl, pendingUrl } from "../src/widget/widget";

const WORKER = "https://deadline-widget-hook.arme-malikinss.workers.dev";

describe("countdownUrl", () => {
  it("puts the deadline into the to param", () => {
    expect(countdownUrl("2026-10-02T09:00")).toBe(`${WORKER}/countdown?to=2026-10-02T09%3A00`);
  });
});

describe("doneUrl", () => {
  it("points to the badge page on the worker", () => {
    expect(doneUrl()).toBe(`${WORKER}/done`);
  });
});

describe("pendingUrl", () => {
  it("points to the no-deadline badge page on the worker", () => {
    expect(pendingUrl()).toBe(`${WORKER}/pending`);
  });
});

describe("isManagedEmbedUrl", () => {
  it("accepts our countdown and badge pages", () => {
    expect(isManagedEmbedUrl(`${WORKER}/countdown?to=2026-10-02T09%3A00`)).toBe(true);
    expect(isManagedEmbedUrl(`${WORKER}/done`)).toBe(true);
    expect(isManagedEmbedUrl(`${WORKER}/pending`)).toBe(true);
  });

  it("rejects other paths on the worker", () => {
    expect(isManagedEmbedUrl(`${WORKER}/`)).toBe(false);
  });

  it("rejects the same path on another host", () => {
    expect(isManagedEmbedUrl("https://example.com/countdown?to=2026-10-02T09%3A00")).toBe(false);
  });

  it("rejects legacy mindfulwidgets urls", () => {
    expect(isManagedEmbedUrl("https://mindfulwidgets.com/embed/notion/countdown/v1")).toBe(false);
  });

  it("rejects unrelated embeds", () => {
    expect(isManagedEmbedUrl("https://youtube.com/watch?v=1")).toBe(false);
  });

  it("rejects invalid urls", () => {
    expect(isManagedEmbedUrl("not a url")).toBe(false);
  });
});