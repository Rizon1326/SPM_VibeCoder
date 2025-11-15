"""
app.py - FastAPI application for AI Chatbot
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import httpx

from .config import settings
from .models import ChatRequest, ChatResponse
from .llm_client import GroqClient

app = FastAPI(title="AI Chatbot Backend", version="1.0.0")

# CORS (allow all during local dev; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, str]:
    return {"status": "running", "service": "AI Chatbot Backend"}

@app.get("/api/health")
async def health() -> Dict[str, str | bool]:
    return {
        "status": "ok",
        "model": settings.groq_model,
        "api_configured": bool(settings.groq_api_key),
    }

@app.get("/api/config")
async def get_config() -> Dict[str, str | bool]:
    return {
        "model": settings.groq_model,
        "api_url": settings.groq_api_url,
        "api_key_configured": bool(settings.groq_api_key),
        "api_key_masked": settings.masked_key(),
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    if not settings.groq_api_key:
        return ChatResponse(error="API key not configured. Set GROQ_API_KEY in .env file", reply=None)

    client = GroqClient()
    try:
        result = await client.chat(req.messages)
        if result["status"] != 200:
            return ChatResponse(error=f"Groq Error {result['status']}: {result.get('text', '')}", reply=None)
        data = result.get("json", {})
        if data.get("choices") and len(data["choices"]) > 0:
            reply = data["choices"][0]["message"]["content"].strip()
            return ChatResponse(reply=reply)
        return ChatResponse(error="Empty response from AI")
    except httpx.TimeoutException:
        return ChatResponse(error="Request timeout - AI took too long to respond")
    except httpx.RequestError as e:
        return ChatResponse(error=f"Network error: {str(e)}")
    except Exception as e:
        return ChatResponse(error=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("AI Chatbot Backend starting at http://127.0.0.1:8000")
    uvicorn.run(app, host=settings.host, port=settings.port)
