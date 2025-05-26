"use client";

import React, { useState } from 'react';
import { apiFetch } from '../../utils/apiClient';

interface LightAnalyzeClientProps {
  userEmail: string;
}

export default function LightAnalyzeClient({ userEmail }: LightAnalyzeClientProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    setError(null);
    setPdfUrl(null);
    
    try {
      const data = await apiFetch<any>('/api/light-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      try {
        const response = await apiFetch('/api/light-generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            product_names: data.product_names || [],
            category_links: data.category_links || [],
            prices: data.prices || [],
            advice: data.advice,
            competitor_summary: data.competitor_summary,
            social_links: data.social_links,
            diagnostic_scores: data.diagnostic_scores
          }),
          responseType: 'blob'
        });
        
        const blob = response as Blob;
        const downloadUrl = window.URL.createObjectURL(blob);
        setPdfUrl(downloadUrl);
      } catch (pdfErr) {
        console.error('Error generating PDF:', pdfErr);
        setError(pdfErr instanceof Error ? pdfErr.message : 'PDFの生成中にエラーが発生しました');
      }
    } catch (err) {
      console.error('Error analyzing URL:', err);
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">軽量ECサイト分析</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <span className="text-sm font-medium text-gray-700">認証済みユーザー: </span>
            <span className="ml-2 text-sm font-bold text-blue-600">{userEmail}</span>
          </div>
          
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            分析するURL
          </label>
          <div className="flex">
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isAnalyzing ? '分析中...' : '分析開始'}
            </button>
          </div>
        </div>
      </div>
      
      {isAnalyzing && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">ECサイトを分析中です。しばらくお待ちください...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {pdfUrl && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-4">分析が完了しました！</h2>
            <p className="text-gray-600 mb-6">PDFレポートが生成されました。下のボタンからダウンロードできます。</p>
            <a
              href={pdfUrl}
              download={`hansokunou_analysis_${Date.now()}.pdf`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              PDFレポートをダウンロード
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
