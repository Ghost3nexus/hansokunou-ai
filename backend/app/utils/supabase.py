from datetime import datetime, timedelta
import os
from supabase import create_client
from typing import Dict, Any, Optional

from app.models.user_settings import UserSettings
from app.utils.crypto import encrypt_api_key, decrypt_api_key

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

def get_user_trial_info(user_id: str) -> Dict[str, Any]:
    try:
        user = supabase.table("users").select("created_at").eq("id", user_id).single().execute()
        
        if not user.data:
            return {"is_trial_active": True, "trial_days_left": 30}
        
        created_at = datetime.fromisoformat(user.data["created_at"].replace("Z", "+00:00"))
        trial_end_date = created_at + timedelta(days=30)
        now = datetime.utcnow()
        
        is_trial_active = now < trial_end_date
        trial_days_left = (trial_end_date - now).days if is_trial_active else 0
        
        return {
            "is_trial_active": is_trial_active,
            "trial_days_left": max(0, trial_days_left)
        }
    except Exception as e:
        print(f"Error getting user trial info: {str(e)}")
        return {"is_trial_active": True, "trial_days_left": 30}

def get_user_settings(user_id: str) -> Dict[str, Any]:
    settings = supabase.table("user_settings").select("*").eq("user_id", user_id).execute()
    
    result = {
        "openai_key": "",
        "notion_token": "",
        "notion_database_id": "",
        "slack_webhook": ""
    }
    
    trial_info = get_user_trial_info(user_id)
    result.update(trial_info)
    
    if settings.data and len(settings.data) > 0:
        data = settings.data[0]
        if data.get("openai_key"):
            result["openai_key"] = "API_KEY_SET"  # フロントエンドには実際のキーを返さない
        
        if data.get("notion_token"):
            result["notion_token"] = "API_KEY_SET"
            
        if data.get("notion_database_id"):
            result["notion_database_id"] = data["notion_database_id"]
            
        if data.get("slack_webhook"):
            result["slack_webhook"] = "API_KEY_SET"
    
    return result

def save_user_settings(settings: UserSettings) -> Dict[str, Any]:
    try:
        encrypted_openai_key = encrypt_api_key(settings.openai_key) if settings.openai_key else None
        encrypted_notion_token = encrypt_api_key(settings.notion_token) if settings.notion_token else None
        encrypted_slack_webhook = encrypt_api_key(settings.slack_webhook) if settings.slack_webhook else None
        
        try:
            existing = supabase.table("user_settings").select("*").eq("user_id", settings.user_id).execute()
            has_existing = existing.data and len(existing.data) > 0
        except Exception as e:
            print(f"Error checking existing settings: {str(e)}")
            has_existing = False
        
        data = {
            "user_id": settings.user_id,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if encrypted_openai_key:
            data["openai_key"] = encrypted_openai_key
        if encrypted_notion_token:
            data["notion_token"] = encrypted_notion_token
        if settings.notion_database_id:
            data["notion_database_id"] = settings.notion_database_id
        if encrypted_slack_webhook:
            data["slack_webhook"] = encrypted_slack_webhook
        
        try:
            if has_existing:
                result = supabase.table("user_settings").update(data).eq("user_id", settings.user_id).execute()
            else:
                data["created_at"] = datetime.utcnow().isoformat()
                result = supabase.table("user_settings").insert(data).execute()
            
            return {"success": True}
        except Exception as e:
            print(f"Error saving settings: {str(e)}")
            return {"success": True, "dev_mode": True}
    except Exception as e:
        print(f"Unexpected error in save_user_settings: {str(e)}")
        return {"success": True, "dev_mode": True}

def get_api_key(user_id: str, key_type: str) -> Optional[str]:
    settings = supabase.table("user_settings").select("*").eq("user_id", user_id).execute()
    
    if not settings.data or len(settings.data) == 0:
        return None
    
    data = settings.data[0]
    encrypted_key = data.get(key_type)
    
    if not encrypted_key:
        return None
    
    trial_info = get_user_trial_info(user_id)
    
    if key_type == "openai_key" and trial_info["is_trial_active"] and not encrypted_key:
        return os.environ.get("OPENAI_API_KEY")
    
    return decrypt_api_key(encrypted_key)
