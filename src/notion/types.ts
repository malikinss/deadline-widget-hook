export interface NotionDate {
  start: string;
  end: string | null;
  time_zone: string | null;
}

export interface NotionProperty {
  type: string;
  formula?: {
    type: string;
    string?: string | null;
  };
  date?: NotionDate | null;
}

export interface NotionPage {
  id: string;
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
