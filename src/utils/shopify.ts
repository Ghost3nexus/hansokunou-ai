import { ShopifyRevenueData, ShopifyStore } from '../types/shopify';
import { apiFetch } from './apiClient';

/**
 * Start the Shopify OAuth flow
 * @param userEmail Email of the user connecting their store
 */
export const connectShopifyStore = async (userEmail: string): Promise<void> => {
  try {
    const data = await apiFetch<{ authorization_url: string }>(`/api/shopify/oauth/start?user_email=${encodeURIComponent(userEmail)}`);
    window.location.href = data.authorization_url;
  } catch (error) {
    console.error('Error connecting Shopify store:', error);
    throw error;
  }
};

/**
 * Disconnect a Shopify store
 * @param userEmail Email of the user
 * @param storeDomain Domain of the store to disconnect
 */
export const disconnectShopifyStore = async (userEmail: string, storeDomain: string): Promise<void> => {
  try {
    await apiFetch('/api/shopify/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail, store_domain: storeDomain }),
    });
  } catch (error) {
    console.error('Error disconnecting Shopify store:', error);
    throw error;
  }
};

/**
 * Fetch Shopify revenue data
 * @param userEmail Email of the user
 * @param storeName Name of the store
 */
export const getShopifyRevenueData = async (userEmail: string, storeName: string): Promise<ShopifyRevenueData> => {
  try {
    return await apiFetch<ShopifyRevenueData>(`/api/shopify/revenue-data?user_email=${encodeURIComponent(userEmail)}&store_name=${encodeURIComponent(storeName)}`);
  } catch (error) {
    console.error('Error fetching Shopify revenue data:', error);
    throw error;
  }
};

/**
 * Refresh Shopify access token
 * @param userEmail Email of the user
 * @param storeName Name of the store
 */
export const refreshShopifyToken = async (userEmail: string, storeName: string): Promise<{ message: string }> => {
  try {
    return await apiFetch<{ message: string }>(`/api/shopify/refresh-token?user_email=${encodeURIComponent(userEmail)}&store_name=${encodeURIComponent(storeName)}`);
  } catch (error) {
    console.error('Error refreshing Shopify token:', error);
    throw error;
  }
};
