"""
llm_client.py - Groq LLM API client
"""
import httpx
from typing import Dict, Any, List
from .models import Message
from .config import settings

class GroqClient:
    def __init__(self, api_key: str | None = None, model: str | None = None, api_url: str | None = None):
        self.api_key = api_key or settings.groq_api_key
        self.model = model or settings.groq_model
        self.api_url = api_url or settings.groq_api_url

    async def chat(self, messages: List[Message], temperature: float = 0.7, max_tokens: int = 1024) -> Dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": [m.dict() for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(self.api_url, json=payload, headers=headers)
        return {"status": resp.status_code, "json": resp.json() if resp.text else {}, "text": resp.text}
