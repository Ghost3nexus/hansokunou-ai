"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/apiClient';

const PLANS = [
  {
    id: 'lite',
    name: 'Lite',
    price: 0,
    description: '基本的な分析機能を無料で利用',
    features: [
      'ECサイト分析（月3回まで）',
      '基本的なGPTアドバイス',
      'PDFレポート（基本版）',
    ],
    priceId: '',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 9800,
    description: '中小規模ECサイト向け分析機能',
    features: [
      'ECサイト分析（月15回まで）',
      '詳細なGPTアドバイス',
      'PDFレポート（詳細版）',
      'Notion連携',
      'Shopify連携',
      '競合分析',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29800,
    description: '大規模ECサイト向け高度分析機能',
    features: [
      'ECサイト分析（無制限）',
      '最高品質GPTアドバイス',
      'PDFレポート（プレミアム版）',
      'Notion連携',
      'Shopify連携',
      '競合分析',
      'Slack通知',
      '優先サポート',
      'カスタムレポート',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    popular: false,
  },
];

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    if (plan.id === 'lite') {
      router.push('/dashboard');
      return;
    }
    
    try {
      setIsLoading(plan.id);
      
      const { url } = await apiFetch<{ url: string }>('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          email: session.user.email,
        }),
      });
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(null);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">料金プラン</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
              plan.popular ? 'ring-2 ring-blue-500 transform md:-translate-y-2' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-sm text-center py-1">
                おすすめプラン
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <p className="text-3xl font-bold">
                  ¥{plan.price.toLocaleString()}<span className="text-base font-normal text-gray-600">/月</span>
                </p>
              </div>
              
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleCheckout(plan)}
                disabled={isLoading === plan.id}
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                  plan.id === 'lite'
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75`}
              >
                {isLoading === plan.id ? '処理中...' : plan.id === 'lite' ? '選択する' : '申し込む'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
