// ./src/config.ts

// Notion API
export const NOTION_API_BASE = "https://api.notion.com/v1";
export const NOTION_VERSION = "2022-06-28";

// Webhook
export const SECRET_HEADER = "x-secret";

// Widget
export const WIDGET_HOST = "mindfulwidgets.com";
export const WIDGET_DEADLINE_PARAM = "to";

export const WIDGET_BASE_URL = "https://mindfulwidgets.com/embed/notion/countdown/v1";
export const WIDGET_PARAMS: Readonly<Record<string, string>> = {
  color: "gray",
  ink: "24a9e1",
  font: "sans",
  style: "flip",
  label: "Deadline",
};
export const DEFAULT_DEADLINE_TIME = "12:00";

// Embed wrapper page
export const EMBED_PATH = "/embed";
export const EMBED_SRC_PARAM = "src";
export const WORKER_ORIGIN = "https://deadline-widget-hook.arme-malikinss.workers.dev";

export const DONE_PATH = "/done";
export const PENDING_PATH = "/pending";

// Databases the worker is allowed to modify.
// Keys are database IDs without dashes, as they appear in Notion links.

export interface DatabaseConfig {
  /** Human-readable name used in logs. */
  name: string;
  /** Date property with the deadline. */
  deadlineProperty: string;
  /** Status property; omit if the database has no status. */
  statusProperty?: string;
  /** Status names that mean the item is finished. */
  completedStatuses: readonly string[];
}

export const DATABASES: Readonly<Record<string, DatabaseConfig>> = {
  "396e539b924b803ca8c9ea399e9c9b5c": {
    name: "Projects",
    deadlineProperty: "Deadline",
    statusProperty: "Status",
    completedStatuses: ["Close", "Done"],
  },
  "397e539b924b80b2872adf70d28b9c58": {
    name: "Tasks",
    deadlineProperty: "Deadline",
    statusProperty: "Status",
    completedStatuses: ["הושלם - Completed"],
  },
  "3e8e539b924b8006a3a5f995677a71b6": {
    name: "Deadline Widgets (test)",
    deadlineProperty: "Deadline",
    statusProperty: "Status",
    completedStatuses: ["Done"],
  },
};