export interface HistoryItem {
  id: string;
  url: string;
  analyzed_at: string;
  product_count: number;
  category_count: number;
  price_count: number;
  has_advice: boolean;
  advice_summary?: string;
  notion_page_url: string;
}

export interface NotionSettings {
  api_token: string;
  database_id: string;
}

export interface SlackSettings {
  webhook_url: string;
}
