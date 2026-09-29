// ./test/widget.spec.ts

import { describe, expect, it } from "vitest";
import {
  buildWidgetUrl,
  doneUrl,
  isDonePageUrl,
  isEmbedWrapperUrl,
  isManagedEmbedUrl,
  isWidgetUrl,
  toEmbedUrl,
} from "../src/widget/widget";

describe("isWidgetUrl", () => {
  it("rejects plain http", () => {
    expect(isWidgetUrl("http://mindfulwidgets.com/embed/x")).toBe(false);
  });

  it("accepts widget host", () => {
    expect(isWidgetUrl("https://mindfulwidgets.com/embed/x")).toBe(true);
  });

  it("rejects host mentioned only in query", () => {
    expect(isWidgetUrl("https://youtube.com/watch?ref=mindfulwidgets.com")).toBe(false);
  });

  it("rejects invalid url", () => {
    expect(isWidgetUrl("not a url")).toBe(false);
  });
});

const WORKER = "https://deadline-widget-hook.arme-malikinss.workers.dev";

describe("toEmbedUrl", () => {
  it("puts the encoded widget url into the src param", () => {
    expect(toEmbedUrl("https://mindfulwidgets.com/embed/x?to=2026-10-02T09%3A00")).toBe(
      `${WORKER}/embed?src=https%3A%2F%2Fmindfulwidgets.com%2Fembed%2Fx%3Fto%3D2026-10-02T09%253A00`,
    );
  });
});

describe("isEmbedWrapperUrl", () => {
  it("accepts the wrapper page", () => {
    expect(isEmbedWrapperUrl(`${WORKER}/embed?src=x`)).toBe(true);
  });

  it("rejects other paths on the worker", () => {
    expect(isEmbedWrapperUrl(`${WORKER}/`)).toBe(false);
  });

  it("rejects the same path on another host", () => {
    expect(isEmbedWrapperUrl("https://example.com/embed?src=x")).toBe(false);
  });
});

describe("isManagedEmbedUrl", () => {
  it("accepts the done badge", () => {
    expect(isManagedEmbedUrl(`${WORKER}/done`)).toBe(true);
  });

  it("accepts both legacy widget and wrapper urls", () => {
    expect(isManagedEmbedUrl("https://mindfulwidgets.com/embed/x")).toBe(true);
    expect(isManagedEmbedUrl(`${WORKER}/embed?src=x`)).toBe(true);
  });

  it("rejects unrelated embeds", () => {
    expect(isManagedEmbedUrl("https://youtube.com/watch?v=1")).toBe(false);
  });
});

describe("buildWidgetUrl", () => {
  it("builds the countdown url from the config template", () => {
    expect(buildWidgetUrl("2026-10-02T12:00")).toBe(
      "https://mindfulwidgets.com/embed/notion/countdown/v1" +
        "?color=gray&ink=24a9e1&font=sans&style=flip&label=Deadline&to=2026-10-02T12%3A00",
    );
  });
});

describe("doneUrl", () => {
  it("points to the badge page on the worker", () => {
    expect(doneUrl()).toBe(`${WORKER}/done`);
  });
});

describe("isDonePageUrl", () => {
  it("accepts the badge page", () => {
    expect(isDonePageUrl(`${WORKER}/done`)).toBe(true);
  });

  it("rejects the wrapper page", () => {
    expect(isDonePageUrl(`${WORKER}/embed?src=x`)).toBe(false);
  });
});