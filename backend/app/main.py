from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

class UrlAnalysisRequest(BaseModel):
    url: HttpUrl

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

@app.post("/analyze")
async def analyze_url(request: UrlAnalysisRequest):
    """
    Analyze the provided URL for marketing insights.
    This is a placeholder implementation that returns mock data.
    """
    try:
        return {
            "url": str(request.url),
            "analysis": {
                "title": "Sample Page Title",
                "description": "This is a sample meta description for the analyzed page.",
                "keywords": ["sample", "marketing", "e-commerce", "analysis"],
                "content_summary": "This is a placeholder for content analysis of the provided URL.",
                "sentiment": "positive",
                "recommendations": [
                    "Add more product images",
                    "Improve call-to-action visibility",
                    "Enhance mobile responsiveness"
                ]
            },
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing URL: {str(e)}")
