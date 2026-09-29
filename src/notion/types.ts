// ./src/notion/types.ts

export interface NotionDate {
  start: string;
  end: string | null;
  time_zone: string | null;
}

export interface NotionProperty {
  type: string;
  date?: NotionDate | null;
  status?: { name: string } | null;
}

export interface NotionParent {
  type: string;
  database_id?: string;
}

export interface NotionPage {
  id: string;
  parent: NotionParent;
  properties: Record<string, NotionProperty>;
}

export interface NotionBlock {
  id: string;
  type: string;
  embed?: { url: string };
}

export interface NotionList<T> {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}