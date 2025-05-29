"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("next") || "/dashboard";

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      await signIn("email", { email, callbackUrl, redirect: false });
      setIsLoading(false);
      alert("ログインリンクをメールで送信しました。メールをご確認ください。");
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HAN-NO (販促脳.AI)</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          ログインしてサービスをご利用ください
        </p>
      </div>
      
      <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            メールアドレス
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : null}
            メールでログイン
          </button>
        </div>
      </form>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HAN-NO (販促脳.AI)</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          読み込み中...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
