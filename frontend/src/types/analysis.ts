export interface DiagnosticScore {
  sns_score: number;
  structure_score: number;
  ux_score: number;
  app_score: number;
  theme_score: number;
}

export interface AnalysisHistoryItem {
  id: string;
  user_email: string;
  url: string;
  analyzed_at: string;
  summary_json: {
    product_names: string[];
    category_links: string[];
    prices: string[];
    advice?: string;
    competitor_summary?: {
      product_count: number;
      price_range: string;
      average_price?: string;
      category_count: number;
      collections?: string[];
      page_type?: string;
      theme?: string;
      apps?: string[];
      dom_elements?: Record<string, boolean>;
      features?: Record<string, boolean>;
    };
    social_links?: {
      instagram?: string;
      twitter?: string;
      activity?: {
        hashtags?: string[];
      };
    };
  };
  tags: string[];
  sns_score?: number;
  structure_score?: number;
  ux_score?: number;
  app_score?: number;
  theme_score?: number;
}
