import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { saveAnalysisHistory } from '@/utils/supabase';

type AnalyzeResponse = {
  url: string;
  analysis: {
    title: string;
    description: string;
    shopify_detected: boolean;
    theme: string;
    apps: string[];
    sns_links: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
    score: {
      sns_score: number;
      structure_score: number;
      ux_score: number;
      app_score: number;
      theme_score: number;
    };
    advice: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const analysisResult = {
      url,
      analysis: {
        title: `Analysis for ${url}`,
        description: 'E-commerce site with standard catalog structure',
        shopify_detected: true,
        theme: 'Dawn',
        apps: ['Product Reviews', 'Klaviyo Email Marketing', 'Shopify Chat'],
        sns_links: {
          twitter: 'https://twitter.com/shopify',
          instagram: 'https://instagram.com/shopify',
          facebook: 'https://facebook.com/shopify',
        },
        score: {
          sns_score: 85,
          structure_score: 78,
          ux_score: 82,
          app_score: 90,
          theme_score: 75,
        },
        advice: 'サイトのユーザビリティは良好ですが、商品ページの表示速度を改善することで、コンバージョン率を向上させることができます。SNS連携も強化されていますが、Instagramの投稿頻度を高めることで、エンゲージメントを向上させることができます。',
      }
    };

    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      await saveAnalysisHistory(
        session.user.email,
        url,
        analysisResult.analysis,
        ['shopify', 'e-commerce'],
        {
          sns_score: analysisResult.analysis.score.sns_score,
          structure_score: analysisResult.analysis.score.structure_score,
          ux_score: analysisResult.analysis.score.ux_score,
          app_score: analysisResult.analysis.score.app_score,
          theme_score: analysisResult.analysis.score.theme_score,
        }
      );
    }

    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
