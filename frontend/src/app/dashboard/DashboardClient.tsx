"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { apiFetch } from '@/utils/apiClient';

interface HistoryItem {
  id: string;
  url: string;
  analyzed_at: string;
  product_count: number;
  category_count: number;
  price_count: number;
  has_advice: boolean;
  advice_summary?: string;
  notion_page_url: string;
  tags: string[];
  summary_json: any;
  diagnostic_scores: {
    sns_score: number;
    structure_score: number;
    ux_score: number;
    app_score: number;
    theme_score: number;
  };
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState<Record<string, boolean>>({});
  const [reanalyzing, setReanalyzing] = useState<Record<string, boolean>>({});
  
  const fetchHistory = async (tags?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/history';
      if (tags && tags.length > 0) {
        const params = new URLSearchParams();
        tags.forEach(tag => params.append('tags', tag));
        url += `?${params.toString()}`;
      }
      
      const data = await apiFetch<{items: HistoryItem[]}>(url);
      setHistory(data.items || []);
      
      const allTags = new Set<string>();
      data.items.forEach((item: HistoryItem) => {
        if (item.tags) {
          item.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      setAvailableTags(Array.from(allTags).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHistory();
  }, []);
  
  useEffect(() => {
    fetchHistory(selectedTags);
  }, [selectedTags]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleDownloadPDF = async (item: HistoryItem) => {
    setPdfLoading(prev => ({ ...prev, [item.id]: true }));
    
    try {
      const blob = await apiFetch<Blob>(`/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: item.url,
          product_names: item.summary_json?.product_names || [],
          category_links: item.summary_json?.category_links || [],
          prices: item.summary_json?.prices || [],
          advice: item.summary_json?.advice,
          competitor_summary: item.summary_json?.competitor_summary,
          social_links: item.summary_json?.social_links
        }),
        responseType: 'blob'
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `hansokunou_analysis_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(err instanceof Error ? err.message : 'PDFのダウンロード中にエラーが発生しました');
    } finally {
      setPdfLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };
  
  const handleReanalyze = async (url: string, id: string) => {
    setReanalyzing(prev => ({ ...prev, [id]: true }));
    
    try {
      window.location.href = `/analyze?url=${encodeURIComponent(url)}`;
    } catch (err) {
      console.error('Error reanalyzing:', err);
      alert(err instanceof Error ? err.message : '再分析中にエラーが発生しました');
      setReanalyzing(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">分析履歴</h1>
      
      {/* Tag filter */}
      {availableTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">タグでフィルター:</h2>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {!loading && !error && history.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">まだ診断履歴がありません。</p>
          <Link href="/analyze" className="mt-4 inline-block text-blue-600 hover:underline">
            新しい分析を始める
          </Link>
        </div>
      )}
      
      {!loading && history.length > 0 && (
        <div className="grid gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-blue-600 truncate max-w-md">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {item.url}
                  </a>
                </h2>
                <span className="text-sm text-gray-500">{formatDate(item.analyzed_at)}</span>
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left column: Stats */}
                <div>
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="bg-gray-100 px-2 py-1 rounded">
                      製品: {item.product_count}
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded">
                      カテゴリ: {item.category_count}
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded">
                      価格: {item.price_count}
                    </div>
                  </div>
                  
                  {item.advice_summary && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">GPTアドバイス:</h3>
                      <p className="text-gray-700">{item.advice_summary}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {item.notion_page_url && (
                  <a 
                    href={item.notion_page_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    Notionで詳細を見る
                  </a>
                )}
                
                <button
                  onClick={() => handleDownloadPDF(item)}
                  disabled={pdfLoading[item.id]}
                  className="text-sm text-green-600 hover:underline flex items-center"
                >
                  {pdfLoading[item.id] ? 'PDFを生成中...' : 'PDFをダウンロード'}
                </button>
                
                <button
                  onClick={() => handleReanalyze(item.url, item.id)}
                  disabled={reanalyzing[item.id]}
                  className="text-sm text-purple-600 hover:underline flex items-center"
                >
                  再分析
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
