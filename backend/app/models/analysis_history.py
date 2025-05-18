from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class DiagnosticScores(BaseModel):
    sns_score: float = Field(0, ge=0, le=10)
    structure_score: float = Field(0, ge=0, le=10)
    ux_score: float = Field(0, ge=0, le=10)
    app_score: float = Field(0, ge=0, le=10)
    theme_score: float = Field(0, ge=0, le=10)

class AnalysisHistoryItem(BaseModel):
    id: Optional[str] = None
    url: str
    analyzed_at: Optional[datetime] = None
    product_count: int = 0
    category_count: int = 0
    price_count: int = 0
    has_advice: bool = False
    advice_summary: Optional[str] = None
    notion_page_url: Optional[str] = None
    tags: List[str] = []
    summary_json: Dict[str, Any] = {}
    diagnostic_scores: Optional[DiagnosticScores] = None

class SaveHistoryRequest(BaseModel):
    url: str
    analysis_result: Dict[str, Any]
    user_email: Optional[str] = None

class HistoryResponse(BaseModel):
    items: List[AnalysisHistoryItem] = []
    status: str = "success"
