// ./test/rules.spec.ts

import { describe, expect, it } from "vitest";
import { DATABASES } from "../src/config";
import type { NotionPage, NotionProperty } from "../src/notion/types";
import { findDatabaseConfig, isCompleted, readDeadline } from "../src/widget/rules";

// Tasks database ID as the API returns it (with dashes).
const TASKS_API_ID = "397e539b-924b-80b2-872a-df70d28b9c58";
const TASKS = DATABASES["397e539b924b80b2872adf70d28b9c58"];
const TEST_DB = DATABASES["3e8e539b924b8006a3a5f995677a71b6"];

function page(properties: Record<string, NotionProperty>, databaseId?: string): NotionPage {
  return {
    id: "p1",
    parent: { type: "database_id", database_id: databaseId },
    properties,
  };
}

function status(name: string | null): NotionProperty {
  return { type: "status", status: name ? { name } : null };
}

function date(start: string, end: string | null = null): NotionProperty {
  return { type: "date", date: { start, end, time_zone: null } };
}

describe("findDatabaseConfig", () => {
  it("finds a database by an API id with dashes", () => {
    expect(findDatabaseConfig(page({}, TASKS_API_ID))?.name).toBe("Tasks");
  });

  it("returns null for an unknown database", () => {
    expect(findDatabaseConfig(page({}, "00000000-0000-0000-0000-000000000000"))).toBeNull();
  });

  it("returns null for a page outside any database", () => {
    expect(findDatabaseConfig(page({}))).toBeNull();
  });
});

describe("isCompleted", () => {
  it("is true for a completed status", () => {
    expect(isCompleted(page({ Status: status("הושלם - Completed") }), TASKS)).toBe(true);
  });

  it("is false for another status", () => {
    expect(isCompleted(page({ Status: status("בביצוע - In process") }), TASKS)).toBe(false);
  });

  it("is false for an empty status", () => {
    expect(isCompleted(page({ Status: status(null) }), TASKS)).toBe(false);
  });

  it("is false when the status property is missing", () => {
    expect(isCompleted(page({}), TEST_DB)).toBe(false);
  });
});

describe("readDeadline", () => {
  it("uses noon for a date without time", () => {
    expect(readDeadline(page({ Deadline: date("2026-10-02") }), TASKS)).toBe("2026-10-02T12:00");
  });

  it("keeps the time when it is set", () => {
    expect(
      readDeadline(page({ Deadline: date("2026-10-02T09:00:00.000+03:00") }), TASKS),
    ).toBe("2026-10-02T09:00");
  });

  it("uses the end of a date range", () => {
    expect(readDeadline(page({ Deadline: date("2026-10-01", "2026-10-05") }), TASKS)).toBe(
      "2026-10-05T12:00",
    );
  });

  it("returns null for an empty deadline", () => {
    expect(readDeadline(page({}), TASKS)).toBeNull();
  });
});