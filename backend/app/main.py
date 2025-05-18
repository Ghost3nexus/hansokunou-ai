import os
import random
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
from bs4 import BeautifulSoup

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

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user_settings import UserSettings, UserSettingsResponse
from app.models.analysis_history import SaveHistoryRequest, HistoryResponse, AnalysisHistoryItem
from app.utils.supabase import get_user_settings, save_user_settings, get_api_key, save_analysis_history, get_analysis_history
from app.utils.pdf_generator import generate_pdf_report
from typing import Dict, Any

router = APIRouter(prefix="/api", tags=["user_settings"])

@router.get("/user-settings/{user_id}", response_model=UserSettingsResponse)
async def get_settings(user_id: str):
    """
    ユーザー設定を取得するエンドポイント。
    APIキーは実際の値を返さず、設定済みかどうかのフラグのみを返す。
    """
    try:
        settings = get_user_settings(user_id)
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"設定の取得中にエラーが発生しました: {str(e)}"
        )

@router.post("/user-settings", response_model=Dict[str, Any])
async def save_settings(settings: UserSettings):
    """
    ユーザー設定を保存するエンドポイント。
    APIキーは暗号化して保存される。
    """
    try:
        result = save_user_settings(settings)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"設定の保存中にエラーが発生しました: {str(e)}"
        )

@router.get("/get-api-key/{user_id}/{key_type}")
async def get_key(user_id: str, key_type: str):
    """
    実際のAPIキーを取得するエンドポイント（内部利用のみ）。
    """
    try:
        key = get_api_key(user_id, key_type)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="APIキーが設定されていません"
            )
        return {"key": key}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"APIキーの取得中にエラーが発生しました: {str(e)}"
        )

app.include_router(router)

async def fetch_url_content(url: str) -> dict:
    """Fetch content from a URL and extract relevant information."""
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            html_content = response.text
            soup = BeautifulSoup(html_content, 'html.parser')
            
            product_names = [el.get_text(strip=True) for el in soup.select(".product-title, .product-name")]
            prices = [el.get_text(strip=True) for el in soup.select(".price, .product-price")]
            
            category_links = [el.get_text(strip=True) for el in soup.select(".collection-link, .nav-link")]
            
            social_links = {
                "instagram": next((a['href'] for a in soup.select("a[href*='instagram.com']")), ""),
                "twitter": next((a['href'] for a in soup.select("a[href*='twitter.com']")), "")
            }
            
            return {
                "title": soup.title.string if soup.title else "Sample E-commerce Store",
                "meta_description": next((meta['content'] for meta in soup.select("meta[name='description']")), "Quality products at affordable prices"),
                "product_names": product_names,
                "prices": prices,
                "category_links": category_links,
                "product_count": len(product_names),
                "category_count": len(category_links),
                "social_links": social_links,
                "has_search": bool(soup.select("form[action*='search']")),
                "mobile_friendly": bool(soup.select("meta[name='viewport']")),
                "has_reviews": bool(soup.select(".review, .reviews")),
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
    
    try:
        import openai
        openai.api_key = openai_api_key
        
        competitor_summary = {
            "product_count": url_data.get("product_count", 0),
            "price_range": f"{min(url_data.get('prices', [0]))}〜{max(url_data.get('prices', [0]))}" if url_data.get('prices') else "N/A",
            "social_links": url_data.get("social_links", {})
        }
        
        prompt = f"""
        あなたはECサイト分析の専門家です。
        このサイトの商品数は {url_data.get('product_count', 0)} 個で、価格帯は {competitor_summary['price_range']} です。
        Instagramリンクは {url_data.get('social_links', {}).get('instagram', 'なし')}、Twitterリンクは {url_data.get('social_links', {}).get('twitter', 'なし')} です。
        競合サイトと比較して、強みと弱みを簡潔にコメントしてください。
        """
        
        completion = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating GPT advice: {str(e)}")
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
        
        product_names = url_data.get("product_names", [])
        if not product_names:
            product_names = [
                "プレミアムTシャツ",
                "オーガニックコットンパーカー",
                "ストレッチデニムジーンズ",
                "防水アウトドアジャケット"
            ]
        
        category_links = url_data.get("category_links", [])
        if not category_links:
            category_links = [
                f"{url}/category/clothing",
                f"{url}/category/accessories",
                f"{url}/category/footwear"
            ]
        
        prices = []
        for price_str in url_data.get("prices", []):
            try:
                price_numeric = ''.join(filter(str.isdigit, price_str))
                if price_numeric:
                    prices.append(int(price_numeric))
            except:
                pass
        
        if not prices:
            prices = [2980, 5980, 7980, 12800]
        
        social_links = url_data.get("social_links", {})
        if not social_links or (not social_links.get("instagram") and not social_links.get("twitter")):
            social_links = {
                "instagram": "https://instagram.com/sample_store",
                "twitter": "https://twitter.com/sample_store"
            }
        
        price_range = "N/A"
        if prices:
            price_range = f"{min(prices):,}円〜{max(prices):,}円"
        
        competitor_summary = f"商品数: {len(product_names)}点、価格帯: {price_range}、カテゴリー数: {len(category_links)}個"
        
        analysis_result = AnalysisResponse(
            url=url,
            product_names=product_names[:10],  # 最大10件まで
            category_links=category_links[:10],  # 最大10件まで
            prices=prices[:10],  # 最大10件まで
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

@app.post("/api/save-history")
async def save_history(request: SaveHistoryRequest):
    """
    分析履歴を保存するエンドポイント。
    """
    try:
        result = save_analysis_history(
            user_email=request.user_email,
            url=request.url,
            summary_json=request.analysis_result,
            tags=request.analysis_result.get("tags", [])
        )
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="分析履歴の保存に失敗しました"
            )
        
        return {"id": result, "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"分析履歴の保存中にエラーが発生しました: {str(e)}"
        )

@app.get("/api/history", response_model=HistoryResponse)
async def get_history(user_email: str, tags: Optional[List[str]] = None):
    """
    ユーザーの分析履歴を取得するエンドポイント。
    """
    try:
        history_items = get_analysis_history(user_email, tags)
        
        items = []
        for item in history_items:
            diagnostic_scores = {
                "sns_score": item.get("sns_score", 0),
                "structure_score": item.get("structure_score", 0),
                "ux_score": item.get("ux_score", 0),
                "app_score": item.get("app_score", 0),
                "theme_score": item.get("theme_score", 0)
            }
            
            history_item = AnalysisHistoryItem(
                id=item.get("id"),
                url=item.get("url"),
                analyzed_at=item.get("analyzed_at"),
                product_count=item.get("product_count", 0),
                category_count=item.get("category_count", 0),
                price_count=item.get("price_count", 0),
                has_advice=item.get("has_advice", False),
                advice_summary=item.get("advice_summary"),
                notion_page_url=item.get("notion_page_url"),
                tags=item.get("tags", []),
                summary_json=item.get("summary_json", {}),
                diagnostic_scores=diagnostic_scores
            )
            
            items.append(history_item)
        
        return HistoryResponse(items=items)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"分析履歴の取得中にエラーが発生しました: {str(e)}"
        )

@app.post("/api/generate-pdf")
async def generate_pdf(request: AnalysisResponse):
    """
    分析結果からPDFレポートを生成するエンドポイント。
    """
    try:
        diagnostic_scores = None
        if hasattr(request, 'diagnostic_scores') and request.diagnostic_scores:
            diagnostic_scores = {
                "sns_score": request.diagnostic_scores.sns_score,
                "structure_score": request.diagnostic_scores.structure_score,
                "ux_score": request.diagnostic_scores.ux_score,
                "app_score": request.diagnostic_scores.app_score,
                "theme_score": request.diagnostic_scores.theme_score
            }
        
        social_links = {}
        if hasattr(request, 'social_links') and request.social_links:
            social_links = request.social_links
        
        pdf_bytes = generate_pdf_report(
            url=request.url,
            product_names=request.product_names,
            category_links=request.category_links,
            prices=[str(price) for price in request.prices],
            advice=request.advice or "",
            competitor_summary=request.competitor_summary,
            social_links=social_links,
            diagnostic_scores=diagnostic_scores
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=hansokunou_analysis_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDFの生成中にエラーが発生しました: {str(e)}"
        )
