"""
models.py - Pydantic data models used by the API
"""
from pydantic import BaseModel
from typing import List, Optional, Dict

class Message(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None

class CodeGenRequest(BaseModel):
    prompt: str
    language: str = "python"
    temperature: float = 0.1

class CodeGenResponse(BaseModel):
    code: Optional[str] = None
    metadata: Optional[Dict] = None
    error: Optional[str] = None

class CodeDownloadRequest(BaseModel):
    code: str
    filename: Optional[str] = None

class CodeBleuRequest(BaseModel):
    reference: str
    candidate: str
    language: str = "python"
    normalize: bool = True

class CodeBleuResponse(BaseModel):
    available: bool
    score: Optional[float] = None
    ngram_match: Optional[float] = None
    weighted_ngram_match: Optional[float] = None
    syntax_match: Optional[float] = None
    dataflow_match: Optional[float] = None
    error: Optional[str] = None
