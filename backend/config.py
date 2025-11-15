"""
config.py - Centralized configuration for AI Chatbot
Loads environment variables and provides typed settings.
"""
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load .env if present
load_dotenv()

class Settings(BaseModel):
    groq_api_url: str = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))

    def masked_key(self) -> str:
        if not self.groq_api_key:
            return "(not set)"
        if len(self.groq_api_key) <= 8:
            return "****"
        return f"{self.groq_api_key[:4]}****{self.groq_api_key[-4:]}"

settings = Settings()
