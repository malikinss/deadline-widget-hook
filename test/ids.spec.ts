// ./test/ids.spec.ts

import { describe, expect, it } from "vitest";
import { normalizeId } from "../src/notion/ids";

describe("normalizeId", () => {
  it("removes dashes from API ids", () => {
    expect(normalizeId("397e539b-924b-80b2-872a-df70d28b9c58")).toBe(
      "397e539b924b80b2872adf70d28b9c58",
    );
  });

  it("lowercases ids", () => {
    expect(normalizeId("397E539B924B80B2872ADF70D28B9C58")).toBe(
      "397e539b924b80b2872adf70d28b9c58",
    );
  });

  it("keeps link ids unchanged", () => {
    expect(normalizeId("397e539b924b80b2872adf70d28b9c58")).toBe(
      "397e539b924b80b2872adf70d28b9c58",
    );
  });
});