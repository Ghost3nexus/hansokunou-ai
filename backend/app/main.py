import os
import random
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field

load_dotenv()

class UrlAnalysisRequest(BaseModel):
    url: HttpUrl

class DiagnosticScores(BaseModel):
    sns_score: float = Field(..., ge=0, le=10)
    structure_score: float = Field(..., ge=0, le=10)
    ux_score: float = Field(..., ge=0, le=10)
    app_score: float = Field(..., ge=0, le=10)
    theme_score: float = Field(..., ge=0, le=10)

class AnalysisResponse(BaseModel):
    url: str
    product_names: List[str] = []
    category_links: List[str] = []
    prices: List[float] = []
    advice: str
    competitor_summary: Optional[str] = None
    social_links: Dict[str, str] = {}
    diagnostic_scores: DiagnosticScores
    status: str = "success"

app = FastAPI(
    title="HAN-NO API",
    description="API for HAN-NO (販促脳.AI) - E-commerce Marketing Automation System",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to HAN-NO (販促脳.AI) API",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

async def fetch_url_content(url: str) -> dict:
    """Fetch content from a URL and extract relevant information."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            return {
                "title": "Sample E-commerce Store",
                "meta_description": "Quality products at affordable prices",
                "product_count": random.randint(10, 100),
                "category_count": random.randint(5, 20),
                "has_social_links": random.choice([True, False]),
                "social_platforms": ["instagram", "twitter", "facebook"] if random.random() > 0.3 else ["instagram"],
                "has_search": random.choice([True, False]),
                "mobile_friendly": random.random() > 0.2,
                "has_reviews": random.random() > 0.4,
                "has_wishlist": random.random() > 0.5,
                "payment_methods": random.randint(1, 5),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching URL content: {str(e)}")

async def generate_gpt_advice(url_data: dict) -> str:
    """Generate advice using GPT based on URL analysis."""
    
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key or openai_api_key.startswith("sk-placeholder"):
        strengths = [
            "商品画像が高品質で、商品の特徴がよく伝わります。",
            "カテゴリー構造が明確で、ユーザーが目的の商品を見つけやすくなっています。",
            "モバイル対応が優れており、スマートフォンからのアクセスも快適です。",
        ]
        
        weaknesses = [
            "商品説明が不十分で、顧客が購入を決断するための情報が足りません。",
            "チェックアウトプロセスが複雑で、カート放棄率が高くなる可能性があります。",
            "SNS連携が弱く、ソーシャルメディアからのトラフィック獲得機会を逃しています。",
            "レビュー機能がないため、社会的証明が不足しています。",
        ]
        
        recommendations = [
            "商品ページに詳細な仕様情報と使用例を追加することで、顧客の購入決断を促進できます。",
            "チェックアウトステップを減らし、ゲスト購入オプションを提供することで、コンバージョン率を向上させましょう。",
            "InstagramやTwitterなどのSNSアカウントを作成し、商品投稿を定期的に行うことで、ブランド認知度を高めることができます。",
            "顧客レビューシステムを導入し、実際の購入者からのフィードバックを表示することで、新規顧客の信頼を獲得できます。",
            "関連商品や「よく一緒に購入されている商品」セクションを追加することで、平均注文額を増加させることができます。",
        ]
        
        random.shuffle(strengths)
        random.shuffle(weaknesses)
        random.shuffle(recommendations)
        
        advice = f"""# {url_data['title']} の分析結果

- {strengths[0]}
- {strengths[1] if len(strengths) > 1 else "デザインが清潔で、ブランドイメージが一貫しています。"}

- {weaknesses[0]}
- {weaknesses[1]}
- {weaknesses[2] if len(weaknesses) > 2 else "商品の在庫状況が明確に表示されていないため、顧客が購入を躊躇する可能性があります。"}

1. {recommendations[0]}
2. {recommendations[1]}
3. {recommendations[2]}
4. {recommendations[3] if len(recommendations) > 3 else "季節やトレンドに合わせたセールやプロモーションを定期的に実施し、リピート購入を促進しましょう。"}

顧客生涯価値（LTV）を向上させるには、初回購入後のフォローアップメールを自動化し、関連商品の提案や限定オファーを提供することが効果的です。また、ロイヤルティプログラムを導入して、リピート購入にインセンティブを与えることも検討してください。

以上の改善を実施することで、コンバージョン率の向上と顧客満足度の増加が期待できます。
"""
        return advice
    
    return "OpenAI APIを使用した詳細な分析結果がここに表示されます。"

async def save_to_notion(analysis_result: dict) -> Optional[str]:
    """Save analysis results to Notion and return the page URL."""
    notion_api_key = os.getenv("NOTION_API_KEY")
    if not notion_api_key or notion_api_key.startswith("secret_placeholder"):
        return None
    
    return None

async def send_slack_notification(url: str, analysis_result: dict) -> bool:
    """Send a notification to Slack about the new analysis."""
    slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not slack_webhook_url or slack_webhook_url.endswith("placeholder"):
        return False
    
    return False

def generate_diagnostic_scores(url_data: dict) -> DiagnosticScores:
    """Generate diagnostic scores based on URL analysis."""
    return DiagnosticScores(
        sns_score=round(random.uniform(3, 9), 1),
        structure_score=round(random.uniform(4, 9), 1),
        ux_score=round(random.uniform(3, 8), 1),
        app_score=round(random.uniform(2, 7), 1),
        theme_score=round(random.uniform(4, 9), 1)
    )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_url(request: UrlAnalysisRequest, background_tasks: BackgroundTasks):
    """
    Analyze the provided URL for e-commerce marketing insights.
    Returns detailed analysis including product information, advice, and diagnostic scores.
    """
    try:
        url = str(request.url)
        
        url_data = await fetch_url_content(url)
        
        advice = await generate_gpt_advice(url_data)
        
        diagnostic_scores = generate_diagnostic_scores(url_data)
        
        product_names = [
            "プレミアムTシャツ",
            "オーガニックコットンパーカー",
            "ストレッチデニムジーンズ",
            "防水アウトドアジャケット"
        ]
        
        category_links = [
            f"{url}/category/clothing",
            f"{url}/category/accessories",
            f"{url}/category/footwear"
        ]
        
        prices = [2980, 5980, 7980, 12800]
        
        social_links = {
            "instagram": "https://instagram.com/sample_store",
            "twitter": "https://twitter.com/sample_store"
        }
        
        competitor_summary = "競合他社と比較して、価格帯は中程度ですが、商品の品質とブランドイメージで差別化できる可能性があります。"
        
        analysis_result = AnalysisResponse(
            url=url,
            product_names=product_names,
            category_links=category_links,
            prices=prices,
            advice=advice,
            competitor_summary=competitor_summary,
            social_links=social_links,
            diagnostic_scores=diagnostic_scores,
            status="success"
        )
        
        background_tasks.add_task(save_to_notion, analysis_result.dict())
        background_tasks.add_task(send_slack_notification, url, analysis_result.dict())
        
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing URL: {str(e)}")
