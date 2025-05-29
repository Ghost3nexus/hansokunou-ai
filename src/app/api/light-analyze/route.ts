import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth-options';
import OpenAI from 'openai';

export const dynamic = "force-static";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-static-export',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const sampleProductNames = [
      "プレミアムTシャツ",
      "オーガニックコットンパーカー",
      "ストレッチデニムジーンズ",
      "防水アウトドアジャケット"
    ];
    
    const sampleCategoryLinks = [
      `${url}/category/clothing`,
      `${url}/category/accessories`,
      `${url}/category/footwear`
    ];
    
    const samplePrices = [2980, 5980, 7980, 12800];
    
    const socialLinks = {
      "instagram": "https://instagram.com/sample_store",
      "twitter": "https://twitter.com/sample_store"
    };
    
    const prompt = `
      あなたはECサイト分析の専門家です。
      以下のURLのECサイトについて分析してください: ${url}
      
      このサイトの想定される商品数は約20-30個で、価格帯は3,000円〜13,000円程度です。
      
      以下の点について分析し、日本語でアドバイスをまとめてください：
      1. UIとUXの評価
      2. 商品構造と価格戦略
      3. SNS連携の効果
      4. 改善点と具体的な提案
      
      レスポンスは500単語以内でまとめてください。
    `;
    
    let advice = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });
      
      advice = completion.choices[0].message.content || "";
    } catch (error) {
      console.error('OpenAI API error:', error);
      advice = "OpenAI APIを使用した詳細な分析結果がここに表示されます。APIキーが設定されていないか、エラーが発生しました。";
    }
    
    const diagnosticScores = {
      sns_score: Math.round(Math.random() * 6 + 4) / 10 * 10,
      structure_score: Math.round(Math.random() * 6 + 4) / 10 * 10,
      ux_score: Math.round(Math.random() * 6 + 4) / 10 * 10,
      app_score: Math.round(Math.random() * 6 + 4) / 10 * 10,
      theme_score: Math.round(Math.random() * 6 + 4) / 10 * 10,
    };
    
    const priceRange = `${Math.min(...samplePrices).toLocaleString()}円〜${Math.max(...samplePrices).toLocaleString()}円`;
    const competitorSummary = `商品数: ${sampleProductNames.length}点、価格帯: ${priceRange}、カテゴリー数: ${sampleCategoryLinks.length}個`;
    
    const analysisResult = {
      url,
      product_names: sampleProductNames,
      category_links: sampleCategoryLinks,
      prices: samplePrices,
      advice,
      competitor_summary: competitorSummary,
      social_links: socialLinks,
      diagnostic_scores: diagnosticScores,
    };
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in POST /api/light-analyze:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
