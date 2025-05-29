from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserSettings(BaseModel):
    user_id: str
    openai_key: Optional[str] = None
    notion_token: Optional[str] = None
    notion_database_id: Optional[str] = None
    slack_webhook: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserSettingsResponse(BaseModel):
    openai_key: str = ""
    notion_token: str = ""
    notion_database_id: str = ""
    slack_webhook: str = ""
    trial_days_left: Optional[int] = None
    is_trial_active: bool = False
