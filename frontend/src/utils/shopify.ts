import { ShopifyRevenueData, ShopifyStore } from '../types/shopify';

/**
 * Start the Shopify OAuth flow
 * @param userEmail Email of the user connecting their store
 */
export const connectShopifyStore = async (userEmail: string): Promise<void> => {
  try {
    const response = await fetch(`/api/shopify/oauth/start?user_email=${encodeURIComponent(userEmail)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start Shopify OAuth flow');
    }
    
    const data = await response.json();
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
    const response = await fetch('/api/shopify/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail, store_domain: storeDomain }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to disconnect Shopify store');
    }
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
    const response = await fetch(`/api/shopify/revenue-data?user_email=${encodeURIComponent(userEmail)}&store_name=${encodeURIComponent(storeName)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Shopify revenue data');
    }
    
    return await response.json();
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
    const response = await fetch(`/api/shopify/refresh-token?user_email=${encodeURIComponent(userEmail)}&store_name=${encodeURIComponent(storeName)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to refresh Shopify token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error refreshing Shopify token:', error);
    throw error;
  }
};
