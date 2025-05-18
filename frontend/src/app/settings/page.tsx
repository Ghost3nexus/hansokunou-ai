"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Settings() {
  const { data: session } = useSession();
  const [openaiKey, setOpenaiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user-settings');
        if (response.ok) {
          const data = await response.json();
          setOpenaiKey(data.openai_key || '');
          setNotionToken(data.notion_token || '');
          setSlackWebhook(data.slack_webhook || '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    if (session) {
      fetchSettings();
    }
  }, [session]);
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openai_key: openaiKey,
          notion_token: notionToken,
          slack_webhook: slackWebhook,
        }),
      });
      
      if (response.ok) {
        setSaveMessage({ type: 'success', text: '設定を保存しました' });
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', text: error.message || '設定の保存に失敗しました' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '設定の保存中にエラーが発生しました' });
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">API設定</h2>
        
        <form onSubmit={handleSaveSettings}>
          <div className="space-y-4">
            <div>
              <label htmlFor="openai_key" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI APIキー
              </label>
              <input
                id="openai_key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
              />
            </div>
            
            <div>
              <label htmlFor="notion_token" className="block text-sm font-medium text-gray-700 mb-1">
                Notion APIトークン
              </label>
              <input
                id="notion_token"
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="secret_..."
              />
            </div>
            
            <div>
              <label htmlFor="slack_webhook" className="block text-sm font-medium text-gray-700 mb-1">
                Slack Webhook URL
              </label>
              <input
                id="slack_webhook"
                type="password"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
          
          {saveMessage.text && (
            <div className={`mt-4 p-3 rounded ${
              saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {saveMessage.text}
            </div>
          )}
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Shopify連携</h2>
        <p className="text-gray-600 mb-4">
          Shopifyストアを連携して、売上データや商品情報を自動的に分析できます。
        </p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Shopifyと連携する
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">サブスクリプション管理</h2>
        <p className="text-gray-600 mb-4">
          サブスクリプションの管理、支払い方法の変更、請求履歴の確認などを行うには、Stripeカスタマーポータルをご利用ください。
        </p>
        <button
          onClick={handleManageSubscription}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          サブスクリプションを管理
        </button>
      </div>
    </div>
  );
}
