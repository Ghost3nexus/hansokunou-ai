from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
