import React, { useState, useEffect } from 'react';
import { ShopifyIntegrationProps, ShopifyStore, ShopifyRevenueData } from '../types/shopify';
import { connectShopifyStore, disconnectShopifyStore, getShopifyRevenueData } from '../utils/shopify';

const ShopifyIntegration: React.FC<ShopifyIntegrationProps> = ({ 
  userEmail,
  onConnect,
  onDisconnect
}) => {
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<ShopifyRevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(false);

  const fetchConnectedStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/shopify/connected-stores?user_email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch connected stores');
      }
      
      const data = await response.json();
      setStores(data.stores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connected stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchConnectedStores();
    }
  }, [userEmail]);

  const handleConnect = async () => {
    try {
      await connectShopifyStore(userEmail);
      onConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Shopify store');
    }
  };

  const handleDisconnect = async (storeName: string) => {
    try {
      if (confirm(`本当に「${storeName}」の連携を解除しますか？`)) {
        await disconnectShopifyStore(userEmail, storeName);
        await fetchConnectedStores();
        onDisconnect(storeName);
        
        if (selectedStore === storeName) {
          setSelectedStore(null);
          setRevenueData(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Shopify store');
    }
  };

  const handleViewRevenue = async (storeName: string) => {
    try {
      setRevenueLoading(true);
      setSelectedStore(storeName);
      
      const data = await getShopifyRevenueData(userEmail, storeName);
      setRevenueData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
    } finally {
      setRevenueLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shopify連携</h2>
        <button 
          onClick={handleConnect}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          新しいShopifyストアを連携
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">まだShopifyストアが連携されていません。</p>
          <p className="text-gray-600 mt-2">「新しいShopifyストアを連携」ボタンをクリックして連携を始めましょう。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.store_name} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{store.store_name}</h3>
                  <p className="text-sm text-gray-500">連携日: {new Date(store.connected_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewRevenue(store.store_name)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    売上データを表示
                  </button>
                  <button
                    onClick={() => handleDisconnect(store.store_name)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                  >
                    連携解除
                  </button>
                </div>
              </div>
              
              {selectedStore === store.store_name && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {revenueLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : revenueData ? (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-gray-600">総注文数</p>
                          <p className="text-xl font-bold">{revenueData.total_orders}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-gray-600">総売上</p>
                          <p className="text-xl font-bold">¥{revenueData.total_revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-sm text-gray-600">平均注文額 (AOV)</p>
                          <p className="text-xl font-bold">¥{revenueData.aov.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm text-gray-600">ユニーク顧客数</p>
                          <p className="text-xl font-bold">{revenueData.unique_customers}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded">
                          <p className="text-sm text-gray-600">リピート顧客数</p>
                          <p className="text-xl font-bold">{revenueData.repeat_customers}</p>
                        </div>
                        <div className="bg-pink-50 p-3 rounded">
                          <p className="text-sm text-gray-600">リピート率</p>
                          <p className="text-xl font-bold">{(revenueData.repeat_purchase_rate * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      {revenueData.monthly_trends && revenueData.monthly_trends.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium mb-2">月次売上推移</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr>
                                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    月
                                  </th>
                                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    注文数
                                  </th>
                                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    売上
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {revenueData.monthly_trends.map((month, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                      {month.month}
                                    </td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                      {month.orders}
                                    </td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                      ¥{month.revenue.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">売上データを取得できませんでした。</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopifyIntegration;
