"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/utils/apiClient';

export default function SettingsClient() {
  const { data: session } = useSession();
  const [openaiKey, setOpenaiKey] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [trialInfo, setTrialInfo] = useState({ 
    isTrialActive: false, 
    daysRemaining: 0 
  });
  
  const fetchSettings = async () => {
    if (!session?.user?.email) return;
    
    try {
      const data = await apiFetch<any>(`/api/user-settings?email=${encodeURIComponent(session.user.email)}`);
      
      if (data) {
        setOpenaiKey(data.openai_api_key || '');
        setNotionToken(data.notion_token || '');
        setNotionDatabaseId(data.notion_database_id || '');
        setSlackWebhook(data.slack_webhook_url || '');
        
        if (data.trial_end_date) {
          const trialEnd = new Date(data.trial_end_date);
          const now = new Date();
          const diffTime = trialEnd.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setTrialInfo({
            isTrialActive: diffDays > 0,
            daysRemaining: Math.max(0, diffDays)
          });
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };
  
  useEffect(() => {
    if (session?.user?.email) {
      fetchSettings();
    }
  }, [session]);
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      const response = await apiFetch<{success: boolean}>('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          openai_api_key: openaiKey,
          notion_token: notionToken,
          notion_database_id: notionDatabaseId,
          slack_webhook_url: slackWebhook
        }),
      });
      
      if (response.success) {
        setSaveMessage({ type: 'success', text: '設定が保存されました' });
      } else {
        setSaveMessage({ type: 'error', text: '設定の保存に失敗しました' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : '設定の保存中にエラーが発生しました' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      const response = await apiFetch<{url: string}>('/api/create-portal-session', {
        method: 'POST',
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error('Error creating portal session:', err);
      alert(err instanceof Error ? err.message : 'サブスクリプション管理ページの作成中にエラーが発生しました');
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
              <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API キー
              </label>
              <input
                id="openaiKey"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {trialInfo.isTrialActive 
                  ? `無料トライアル期間中です（残り${trialInfo.daysRemaining}日）。APIキーの設定は任意です。` 
                  : 'OpenAI APIキーを設定すると、より高度な分析が可能になります。'}
              </p>
            </div>
            
            <div>
              <label htmlFor="notionToken" className="block text-sm font-medium text-gray-700 mb-1">
                Notion APIトークン
              </label>
              <input
                id="notionToken"
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="secret_..."
              />
            </div>
            
            <div>
              <label htmlFor="notionDatabaseId" className="block text-sm font-medium text-gray-700 mb-1">
                Notion データベースID
              </label>
              <input
                id="notionDatabaseId"
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            
            <div>
              <label htmlFor="slackWebhook" className="block text-sm font-medium text-gray-700 mb-1">
                Slack Webhook URL
              </label>
              <input
                id="slackWebhook"
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '設定を保存'}
              </button>
              
              {saveMessage.text && (
                <div className={`mt-3 p-2 rounded ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {saveMessage.text}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">サブスクリプション管理</h2>
        
        <button
          onClick={handleManageSubscription}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          サブスクリプションを管理
        </button>
      </div>
    </div>
  );
}
