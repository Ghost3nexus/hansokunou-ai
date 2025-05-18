"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("https://test-app-tunnel-iuebnls6.devinapps.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa("user:34943c21ddc46836f00037963e6f2209")
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      console.log("Analysis result:", data);
      
      alert("分析結果がコンソールに表示されました。開発者ツールを開いて確認してください。");
    } catch (error) {
      console.error("Error analyzing URL:", error);
      alert("エラーが発生しました。コンソールを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HAN-NO (販促脳.AI)</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            URLを入力して分析を開始してください
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              分析するURL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !url}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || !url
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? "分析中..." : "分析開始"}
            </button>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        HAN-NO (販促脳.AI) - E-commerce Marketing Automation System
      </footer>
    </div>
  );
}
