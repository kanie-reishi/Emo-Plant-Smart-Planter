from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import sqlite3
import os

router = APIRouter()

DB_FILE = os.path.join(os.path.dirname(__file__), '..', 'plant_data.db')

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

class TokenData(BaseModel):
    user_email: str
    fcm_token: str

@router.post("/save-fcm-token")
def save_fcm_token(data: TokenData, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    # Create table if not exists (should be in database init but putting here for safety)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_tokens (
            email TEXT PRIMARY KEY,
            fcm_token TEXT NOT NULL
        )
    ''')
    
    cursor.execute(
        "INSERT INTO user_tokens (email, fcm_token) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET fcm_token = excluded.fcm_token",
        (data.user_email, data.fcm_token)
    )
    db.commit()
    return {"status": "success", "message": "FCM token saved successfully"}
