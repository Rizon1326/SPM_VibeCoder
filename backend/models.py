"""
models.py - Pydantic data models used by the API
"""
from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None
