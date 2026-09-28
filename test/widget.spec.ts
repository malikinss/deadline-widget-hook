// ./test/widget.spec.ts

import { describe, expect, it } from "vitest";
import { isWidgetUrl, withDeadline } from "../src/widget/widget";

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

describe("withDeadline", () => {
  it("replaces only the deadline param", () => {
    expect(
      withDeadline(
        "https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-10-02T06%3A00&theme=light",
        "2026-10-02T09:00",
      ),
    ).toBe("https://mindfulwidgets.com/embed/x?label=Deadline&to=2026-10-02T09%3A00&theme=light");
  });
});