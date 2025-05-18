from cryptography.fernet import Fernet
import os
import base64
from typing import Optional

def get_encryption_key() -> bytes:
    key = os.environ.get("ENCRYPTION_KEY")
    if not key:
        key = Fernet.generate_key().decode()
        os.environ["ENCRYPTION_KEY"] = key
    
    try:
        if isinstance(key, str):
            key_bytes = key.encode()
            Fernet(key_bytes)
            return key_bytes
        return key
    except Exception:
        new_key = Fernet.generate_key()
        os.environ["ENCRYPTION_KEY"] = new_key.decode()
        return new_key

def encrypt_api_key(api_key: str) -> Optional[str]:
    if not api_key:
        return None
    
    key = get_encryption_key()
    f = Fernet(key)
    encrypted_key = f.encrypt(api_key.encode())
    return base64.b64encode(encrypted_key).decode()

def decrypt_api_key(encrypted_key: str) -> Optional[str]:
    if not encrypted_key:
        return None
    
    key = get_encryption_key()
    f = Fernet(key)
    try:
        decrypted_key = f.decrypt(base64.b64decode(encrypted_key))
        return decrypted_key.decode()
    except Exception:
        return None
