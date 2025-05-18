"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Analyze() {
  const searchParams = useSearchParams();
  const urlParam = searchParams?.get('url');
  
  const [url, setUrl] = useState(urlParam || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (urlParam) {
      handleAnalyze();
    }
  }, [urlParam]);
  
  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
      
      await fetch('/api/save-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          analysis_result: data,
        }),
      });
    } catch (err) {
      console.error('Error analyzing URL:', err);
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!result) return;
    
    try {
      const response = await fetch(`/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          product_names: result.product_names || [],
          category_links: result.category_links || [],
          prices: result.prices || [],
          advice: result.advice,
          competitor_summary: result.competitor_summary,
          social_links: result.social_links
        }),
      });
      
      if (!response.ok) {
        throw new Error('PDFの生成に失敗しました');
      }
      
      const blob = await response.blob();
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
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ECサイト分析</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="mb-4">
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
      
      {result && (
        <div className="space-y-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">分析結果</h2>
            
            {result.diagnostic_scores && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">診断スコア</h3>
                <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">スコアチャートがここに表示されます</p>
                </div>
              </div>
            )}
            
            {result.advice && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">GPTアドバイス</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line">{result.advice}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                PDFレポートをダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
