export interface PlanOption {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  priceId?: string; // Stripe price ID
  popular?: boolean;
}

export const PLANS: PlanOption[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: 0,
    description: '基本的なECサイト分析',
    features: [
      '販促診断 (月5回まで)',
      'GPT-4による改善提案',
      'カテゴリ分析',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 15,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    description: '中小規模ECサイト向け',
    popular: true,
    features: [
      '販促診断 (無制限)',
      'GPT-4による改善提案',
      'カテゴリ分析',
      'Notion連携',
      'Slack通知',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    description: '大規模ECサイト向け',
    features: [
      '販促診断 (無制限)',
      'GPT-4による改善提案',
      'カテゴリ分析',
      'Notion連携',
      'Slack通知',
      '優先サポート',
      'カスタムレポート',
    ],
  },
];
