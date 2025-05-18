export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  product_names: string[];
  category_links: string[];
  prices: string[];
  advice?: string;
  notion_page_url?: string;
  competitor_summary?: {
    product_count: number;
    price_range: string;
    category_count: number;
  };
  social_links?: {
    instagram?: string;
    twitter?: string;
  };
  score_advice?: string;
  ltv_prediction?: {
    ltv: string;
    arpu: string;
    frequency: number;
    retention_score: number;
    insights: string[];
  };
}

export interface GeneratePDFRequest {
  url: string;
  product_names: string[];
  category_links: string[];
  prices: string[];
  advice?: string;
  subscription_plan?: string;
  competitor_summary?: {
    product_count: number;
    price_range: string;
    category_count: number;
  };
  social_links?: {
    instagram?: string;
    twitter?: string;
  };
  score_advice?: string;
  ltv_prediction?: {
    ltv: string;
    arpu: string;
    frequency: number;
    retention_score: number;
    insights: string[];
  };
}
