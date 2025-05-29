export interface ShopifyStore {
  store_name: string;
  connected_at: string;
}

export interface ConnectedStoresResponse {
  stores: ShopifyStore[];
}

export interface ShopifyRevenueData {
  total_orders: number;
  total_revenue: number;
  unique_customers: number;
  repeat_customers: number;
  repeat_purchase_rate: number;
  aov: number;
  time_period: string;
  monthly_trends?: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

export interface LtvValidation {
  predicted_ltv: number;
  actual_ltv: number;
  accuracy: number;
  insights: string[];
}

export interface ShopifyIntegrationProps {
  userEmail: string;
  onConnect: () => void;
  onDisconnect: (storeName: string) => void;
}

export interface ShopifyStoreCardProps {
  store: ShopifyStore;
  onDisconnect: (storeName: string) => void;
  onViewRevenue: (storeName: string) => void;
}

export interface ShopifyRevenueDataProps {
  store: ShopifyStore;
  revenueData: ShopifyRevenueData;
  ltvValidation?: LtvValidation;
}
