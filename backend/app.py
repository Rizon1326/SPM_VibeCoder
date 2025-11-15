"""
app.py - FastAPI application for AI Chatbot
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict
import httpx
import tempfile
import os
import time

from .config import settings
from .models import ChatRequest, ChatResponse, Message, CodeGenRequest, CodeGenResponse, CodeDownloadRequest, CodeBleuRequest, CodeBleuResponse
from .llm_client import GroqClient
from .utils.code_utils import extract_code_block, is_code_like, sanitize_filename
from .utils.codebleu_utils import calculate_codebleu

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
    """
    CONVERSATIONAL CHAT MODE: Normal chat with explanations and context.
    Uses higher temperature for creative, helpful responses.
    """
    if not settings.groq_api_key:
        return ChatResponse(error="API key not configured. Set GROQ_API_KEY in .env file")

    client = GroqClient()
    try:
        # Use normal temperature for conversational chat
        result = await client.chat(req.messages, temperature=0.7, max_tokens=1024)
        
        if result["status"] != 200:
            return ChatResponse(error=f"LLM Error {result['status']}: {result.get('text', '')}")
        
        data = result.get("json", {})
        if data.get("choices") and len(data["choices"]) > 0:
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply)
        
        return ChatResponse(error="Empty response from LLM")
    
    except Exception as e:
        return ChatResponse(error=f"Chat failed: {str(e)}")

@app.post("/api/generate_code", response_model=CodeGenResponse)
async def generate_code(req: CodeGenRequest) -> CodeGenResponse:
    """
    STRICT CODE GENERATOR: Returns ONLY code, no explanations, no comments.
    Optimized for industry-grade code generation with CodeBLEU verification.
    """
    if not settings.groq_api_key:
        return CodeGenResponse(error="API key not configured. Set GROQ_API_KEY in .env file")

    # STRICT system prompt - code only, no explanations
    system_prompt = (
        f"You are a code generation engine. "
        f"Language: {req.language.upper()}. "
        f"CRITICAL RULES:\n"
        f"1. Return ONLY executable code - no explanations, no descriptions, no comments\n"
        f"2. Do NOT use markdown code blocks (no ```)\n"
        f"3. Do NOT add any text before or after the code\n"
        f"4. Include necessary imports at the top\n"
        f"5. Write clean, production-ready, syntactically correct code\n"
        f"6. If the task requires multiple functions/classes, include all in one response\n"
        f"OUTPUT FORMAT: Pure {req.language} code only."
    )
    
    messages = [
        Message(role="system", content=system_prompt),
        Message(role="user", content=req.prompt)
    ]
    
    client = GroqClient()
    start_time = time.time()
    
    try:
        # Use lower temperature for deterministic, correct code
        result = await client.chat(messages, temperature=req.temperature, max_tokens=2048)
        latency_ms = int((time.time() - start_time) * 1000)
        
        if result["status"] != 200:
            return CodeGenResponse(error=f"LLM Error {result['status']}: {result.get('text', '')}")
        
        data = result.get("json", {})
        if data.get("choices") and len(data["choices"]) > 0:
            raw_response = data["choices"][0]["message"]["content"].strip()
            
            # Try to extract code from markdown block if LLM adds it anyway
            code = extract_code_block(raw_response, req.language)
            if not code:
                # Use raw response if no markdown block (which is what we want)
                code = raw_response
            
            # Clean up any remaining explanatory text
            # If code looks mixed with text, try to extract just the code part
            if not is_code_like(code):
                # LLM violated rules - try to salvage pure code
                lines = code.split('\n')
                code_lines = []
                for line in lines:
                    # Skip lines that look like explanations
                    if line.strip() and not line.strip().startswith(('#', '//', '/*', '*', 'Here', 'This', 'The ')):
                        code_lines.append(line)
                if code_lines:
                    code = '\n'.join(code_lines)
            
            return CodeGenResponse(
                code=code,
                metadata={
                    "model": settings.groq_model,
                    "latencyMs": latency_ms,
                    "language": req.language,
                    "temperature": req.temperature
                }
            )
        
        return CodeGenResponse(error="Empty response from LLM")
    
    except Exception as e:
        return CodeGenResponse(error=f"Code generation failed: {str(e)}")


@app.post("/api/download_code")
async def download_code(req: CodeDownloadRequest):
    """
    Download generated code as a proper source file (.py, .cpp, .java, etc.)
    Returns file ready for download with correct MIME type.
    """
    try:
        # Sanitize filename and ensure proper extension
        safe_filename = sanitize_filename(req.filename if req.filename else "generated_code.py")
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=f"_{safe_filename}")
        temp_file.write(req.code)
        temp_file.close()
        
        # Determine MIME type based on extension
        mime_types = {
            '.py': 'text/x-python',
            '.cpp': 'text/x-c++src',
            '.c': 'text/x-csrc',
            '.java': 'text/x-java',
            '.js': 'text/javascript',
            '.ts': 'text/typescript',
            '.go': 'text/x-go',
            '.rs': 'text/x-rust'
        }
        ext = os.path.splitext(safe_filename)[1]
        media_type = mime_types.get(ext, 'text/plain')
        
        return FileResponse(
            path=temp_file.name,
            filename=safe_filename,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={safe_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.post("/api/verify_code", response_model=CodeBleuResponse)
async def verify_code(req: CodeBleuRequest) -> CodeBleuResponse:
    """
    AUTOMATED CODE VERIFICATION TOOL using CodeBLEU metric.
    
    Compares AI-generated code with human reference code to verify correctness.
    Returns CodeBLEU score (0-1) with component breakdown:
    - N-gram match: Token-level similarity
    - Weighted N-gram: Keyword-weighted similarity  
    - Syntax match: AST structure similarity
    - Dataflow match: Program behavior similarity
    
    Industry standard: Score >= 0.7 indicates high correctness.
    """
    if not req.candidate or not req.reference:
        return CodeBleuResponse(
            available=False,
            error="Both generated code (candidate) and reference code are required for verification"
        )
    
    try:
        result = calculate_codebleu(
            reference=req.reference,
            candidate=req.candidate,
            language=req.language,
            normalize=req.normalize
        )
        
        if not result["available"]:
            return CodeBleuResponse(
                available=False,
                error=result.get("error", "CodeBLEU library not available")
            )
        
        return CodeBleuResponse(
            available=True,
            score=result["score"],
            ngram_match=result["ngram_match"],
            weighted_ngram_match=result["weighted_ngram_match"],
            syntax_match=result["syntax_match"],
            dataflow_match=result["dataflow_match"]
        )
    
    except Exception as e:
        return CodeBleuResponse(
            available=False,
            error=f"Verification failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    print("AI Chatbot Backend starting at http://127.0.0.1:8000")
    uvicorn.run(app, host=settings.host, port=settings.port)
