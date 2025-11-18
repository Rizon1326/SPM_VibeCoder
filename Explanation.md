# AI Code Assistant - Complete Technical Explanation

**An industry-grade AI code generator with strict code-only output and automated CodeBLEU verification**

Reengineered by: **Mahir, Rafid & Mehedi**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Core Components](#3-core-components)
4. [Request Flow](#4-request-flow)
5. [API Endpoints](#5-api-endpoints)
6. [Data Models](#6-data-models)
7. [Frontend Details](#7-frontend-details)
8. [Backend Details](#8-backend-details)
9. [CodeBLEU Verification](#9-codebleu-verification)
10. [Configuration](#10-configuration)
11. [Security & Best Practices](#11-security--best-practices)
12. [Code Examples](#12-code-examples)

---

## 1. Project Overview

### What is This?

This is a **dual-mode AI assistant** that combines:

- **💬 Conversational Chat Mode**: Normal Q&A with explanations and context
- **💻 Strict Code Generation Mode**: Returns ONLY executable code with NO explanations
- **📊 Automated Verification**: CodeBLEU metric to verify code correctness

### Why Two Modes?

- **Chat Mode** (Temperature 0.7): Creative, helpful, explains concepts
- **Code Mode** (Temperature 0.1): Deterministic, correct, production-ready code
- **Verify Mode**: Automatically checks if generated code matches expected solution

### Key Innovation

Traditional code generators mix code with explanations. This project **strictly separates** them:

- Click **"Send"** → Get explanations and discussion
- Click **"💻 Code"** → Get ONLY raw, executable code
- Click **"📊 Verify"** → Get objective correctness score (0-100%)

---

## 2. Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.html + CSS + JavaScript (main.js)             │  │
│  │  - Chat UI with Light/Dark theme                     │  │
│  │  - 3 Buttons: Send, Code, Verify                     │  │
│  │  - Verification Panel (sliding from right)           │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │ HTTP Requests (JSON)                        │
└───────────────┼─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Python)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  app.py - 4 Main Endpoints:                          │  │
│  │  1. POST /api/chat         → Conversational mode     │  │
│  │  2. POST /api/generate_code → Strict code mode       │  │
│  │  3. POST /api/verify_code   → CodeBLEU verification  │  │
│  │  4. POST /api/download_code → File download          │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │  llm_client.py - Groq API Client (httpx)             │  │
│  └────────────┬─────────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                 GROQ LLM API (External)                     │
│              llama-3.3-70b-versatile                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**

- Pure HTML5, CSS3, Vanilla JavaScript (no frameworks)
- CSS Variables for theming
- LocalStorage for theme persistence
- Fetch API for HTTP requests

**Backend:**

- FastAPI (async Python web framework)
- Pydantic (data validation)
- httpx (async HTTP client)
- uvicorn (ASGI server)

**Code Analysis:**

- CodeBLEU (industry-standard code similarity metric)
- Black (Python code formatter)
- Tree-sitter (syntax parsing)

---

## 3. Core Components

### 3.1 Frontend Structure

```
├── index.html              # Main UI structure
├── css/style.css           # Theming & responsive design
└── js/main.js              # Application logic
```

**Key Frontend Variables:**

```javascript
conversationHistory = [...]  // Full chat context
lastGeneratedCode = null     // Last code for verification
```

**Key Frontend Functions:**

```javascript
sendMessage()         // Chat mode - conversational
generateCode()        // Code mode - strict code only
calculateCodeBLEU()   // Verification mode
downloadCode()        // Save as .py, .java, .cpp, etc.
```

### 3.2 Backend Structure

```
backend/
├── __init__.py            # Package marker
├── app.py                 # FastAPI application (4 endpoints)
├── config.py              # Environment configuration
├── models.py              # Pydantic data models (7 classes)
├── llm_client.py          # Groq API client
└── utils/
    ├── __init__.py
    ├── code_utils.py      # Code extraction & sanitization
    └── codebleu_utils.py  # CodeBLEU calculation
```

### 3.3 Configuration Files

```
├── .env                   # Secrets (API key) - NOT in git
├── .env.example           # Template for .env
├── requirements.txt       # Python dependencies
└── start.sh              # Launch script (frontend + backend)
```

---

## 4. Request Flow

### 4.1 Conversational Chat Flow

```
1. User types "Explain recursion" → clicks "Send"
2. Frontend: addMessage() displays user bubble
3. Frontend: callLLM() sends POST /api/chat
   Body: { messages: [ {role, content}, ... ] }
4. Backend: chat() function processes request
5. Backend: Calls Groq with temperature=0.7 (creative)
6. Groq: Returns explanation with examples
7. Backend: Returns { reply: "Recursion is..." }
8. Frontend: Displays AI bubble with markdown formatting
```

### 4.2 Strict Code Generation Flow

```
1. User types "write a factorial function" → clicks "💻 Code"
2. Frontend: detectLanguage() identifies "python"
3. Frontend: generateCode() sends POST /api/generate_code
   Body: { prompt: "...", language: "python", temperature: 0.1 }
4. Backend: generate_code() builds STRICT system prompt:
   "CRITICAL RULES:
    1. Return ONLY executable code - no explanations
    2. Do NOT use markdown code blocks
    3. Do NOT add any text before or after
    4. Include necessary imports at the top
    5. Write clean, production-ready code
    6. OUTPUT FORMAT: Pure python code only."
5. Backend: Calls Groq with temperature=0.1 (deterministic)
6. Backend: extract_code_block() removes any markdown
7. Backend: is_code_like() validates it's actual code
8. Backend: Returns { code: "def factorial(n):\n...", metadata: {...} }
9. Frontend: Displays ONLY code (no explanations)
10. Frontend: Adds download button (saves as .py file)
```

### 4.3 Code Verification Flow

```
1. User pastes reference code and generated code → clicks "📊 Verify"
2. Frontend: calculateCodeBLEU() sends POST /api/verify_code
   Body: { 
     reference: "def factorial(n):\n  return math.factorial(n)",
     candidate: "def factorial(n):\n  if n==0: return 1\n...",
     language: "python",
     normalize: true
   }
3. Backend: verify_code() calls calculate_codebleu()
4. Utils: normalize_code() formats both with Black
5. Utils: calc_codebleu() computes 4 metrics:
   - N-gram match (token similarity)
   - Weighted N-gram (keyword similarity)
   - Syntax match (AST structure)
   - Dataflow match (program behavior)
6. Backend: Returns { score: 0.73, ngram_match: 0.68, ... }
7. Frontend: Color-codes result:
   - Green (≥70%): "EXCELLENT - High Correctness"
   - Orange (30-70%): "MODERATE - Needs Improvement"
   - Red (<30%): "POOR - Low Correctness"
```

---

## 5. API Endpoints

### 5.1 Health & Config Endpoints

#### GET /api/health

**Purpose:** Check backend status and LLM configuration

**Response:**

```json
{
  "status": "ok",
  "model": "llama-3.3-70b-versatile",
  "api_configured": true
}
```

#### GET /api/config

**Purpose:** Get safe configuration (API key masked)

**Response:**

```json
{
  "model": "llama-3.3-70b-versatile",
  "api_url": "https://api.groq.com/openai/v1/chat/completions",
  "api_key_configured": true,
  "api_key_masked": "gsk_****abc123"
}
```

### 5.2 Chat Endpoint

#### POST /api/chat

**Purpose:** Conversational mode with explanations

**Request:**

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain binary search"}
  ]
}
```

**Response:**

```json
{
  "reply": "Binary search is an efficient algorithm...",
  "error": null
}
```

**Temperature:** 0.7 (creative, detailed explanations)

### 5.3 Code Generation Endpoint

#### POST /api/generate_code

**Purpose:** Strict code-only generation

**Request:**

```json
{
  "prompt": "write a function to find prime numbers",
  "language": "python",
  "temperature": 0.1
}
```

**Response:**

```json
{
  "code": "def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True",
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "latencyMs": 531,
    "language": "python",
    "temperature": 0.1
  },
  "error": null
}
```

**Key Features:**

- 6-rule strict system prompt
- Temperature 0.1 (deterministic)
- Automatic code extraction (removes markdown)
- Validation (is_code_like check)

### 5.4 Code Verification Endpoint

#### POST /api/verify_code

**Purpose:** Calculate CodeBLEU score for correctness

**Request:**

```json
{
  "reference": "def factorial(n):\n    return math.factorial(n)",
  "candidate": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)",
  "language": "python",
  "normalize": true
}
```

**Response:**

```json
{
  "available": true,
  "score": 0.73,
  "ngram_match": 0.68,
  "weighted_ngram_match": 0.71,
  "syntax_match": 0.75,
  "dataflow_match": 0.78,
  "error": null
}
```

**Score Interpretation:**

- **≥ 0.70**: Production-ready (industry standard)
- **0.50-0.69**: Good similarity, minor differences
- **0.30-0.49**: Moderate similarity, needs review
- **< 0.30**: Low similarity, significant differences

### 5.5 Download Endpoint

#### POST /api/download_code

**Purpose:** Download code as proper source file

**Request:**

```json
{
  "code": "def hello():\n    print('Hello')",
  "filename": "greet.py"
}
```

**Response:** File download (Content-Disposition: attachment)

**Supported Extensions:** .py, .java, .cpp, .c, .js, .ts, .go, .rs, .cs

---

## 6. Data Models

### 6.1 Message Models

```python
class Message(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None
```

### 6.2 Code Generation Models

```python
class CodeGenRequest(BaseModel):
    prompt: str
    language: str = "python"
    temperature: float = 0.1

class CodeGenResponse(BaseModel):
    code: Optional[str] = None
    metadata: Optional[Dict] = None
    error: Optional[str] = None
```

### 6.3 Verification Models

```python
class CodeBleuRequest(BaseModel):
    reference: str      # Expected/correct code
    candidate: str      # AI-generated code
    language: str = "python"
    normalize: bool = True  # Use Black formatting

class CodeBleuResponse(BaseModel):
    available: bool
    score: Optional[float] = None
    ngram_match: Optional[float] = None
    weighted_ngram_match: Optional[float] = None
    syntax_match: Optional[float] = None
    dataflow_match: Optional[float] = None
    error: Optional[str] = None
```

---

## 7. Frontend Details

### 7.1 Theme System

**Implementation:**

```javascript
// CSS Variables in :root[data-theme="light"] and :root[data-theme="dark"]
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
```

**Persistence:** Uses `localStorage.getItem('theme')` to remember preference

### 7.2 Message Rendering

**Markdown Support:**

- **Bold:** `**text**` → `<strong>text</strong>`
- **Italic:** `*text*` → `<em>text</em>`
- **Code:** `` `code` `` → `<code>code</code>`
- **Headers:** `### Title` → `<strong>Title</strong>`
- **Lists:** `- item` → `<div>• item</div>`
- **Code blocks:** ` ```python\ncode\n``` ` → Formatted with download button

### 7.3 Language Detection

```javascript
function detectLanguage(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('python')) return 'python';
  if (lower.includes('java') && !lower.includes('javascript')) return 'java';
  if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
  if (lower.includes('javascript')) return 'javascript';
  // ... more languages
  return 'python'; // Default
}
```

### 7.4 Debug Toolkit

**Browser Console Helpers:**

```javascript
ChatDebug.health()        // Check backend status
ChatDebug.config()        // View configuration
ChatDebug.memory()        // Show conversation history
ChatDebug.code()          // Get last generated code
ChatDebug.verify(ref, gen) // Test verification
ChatDebug.clear()         // Reset conversation
```

---

## 8. Backend Details

### 8.1 Environment Configuration

**config.py:**

```python
class Settings(BaseModel):
    groq_api_url: str = os.getenv("GROQ_API_URL", "...")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))
```

**Usage:** `from .config import settings`

### 8.2 LLM Client

**Groq API Client (httpx):**

```python
async def chat(self, messages: List[Message], temperature: float = 0.7, max_tokens: int = 1024):
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
    return {"status": resp.status_code, "json": resp.json(), "text": resp.text}
```

**Key Parameters:**

- `temperature=0.1`: Code generation (deterministic)
- `temperature=0.7`: Chat mode (creative)
- `max_tokens=2048`: Code generation
- `max_tokens=1024`: Chat mode

### 8.3 Code Utilities

#### extract_code_block()

**Purpose:** Remove markdown code blocks if LLM violates rules

**Logic:**

1. Try ` ```python\ncode\n``` ` pattern
2. Try generic ` ```\ncode\n``` ` pattern
3. Return original if no markdown found

#### is_code_like()

**Purpose:** Validate text contains actual code

**Patterns Checked:**

- `def function_name(` (Python function)
- `class ClassName` (Class definition)
- `import module` (Import statements)
- `if condition:` (Control flow)
- `{}[]` (Braces/brackets)
- `;` at line end (C/C++/Java)

#### sanitize_filename()

**Purpose:** Prevent path traversal attacks

**Sanitization:**

1. Remove `/\:*?"<>|` characters
2. Strip leading/trailing `.` and spaces
3. Add `.py` extension if missing
4. Limit to 100 characters

---

## 9. CodeBLEU Verification

### What is CodeBLEU?

**CodeBLEU** is an industry-standard metric for measuring **code similarity**, combining:

1. **N-gram Match** (25% weight): Token-level similarity
2. **Weighted N-gram Match** (25% weight): Keyword-weighted similarity  
3. **Syntax Match** (25% weight): Abstract Syntax Tree (AST) similarity
4. **Dataflow Match** (25% weight): Program behavior similarity

### Why CodeBLEU?

Traditional text metrics (BLEU, ROUGE) fail for code:

```python
# Functionally identical, but text-based metrics give low scores:
Code A: if x > 0: return True
Code B: if x > 0:
            return True
```

CodeBLEU understands **code semantics**, not just text.

### Implementation

```python
def calculate_codebleu(reference: str, candidate: str, language: str, normalize: bool):
    # Step 1: Normalize formatting (Black for Python)
    if normalize and language == "python":
        reference = black.format_str(reference, mode=black.Mode(line_length=88))
        candidate = black.format_str(candidate, mode=black.Mode(line_length=88))
    
    # Step 2: Calculate CodeBLEU
    result = calc_codebleu(
        references=[reference],
        predictions=[candidate],
        lang=language.lower(),
        weights=(0.25, 0.25, 0.25, 0.25)
    )
    
    return {
        "score": result.get("codebleu", 0.0),
        "ngram_match": result.get("ngram_match_score", 0.0),
        "weighted_ngram_match": result.get("weighted_ngram_match_score", 0.0),
        "syntax_match": result.get("syntax_match_score", 0.0),
        "dataflow_match": result.get("dataflow_match_score", 0.0)
    }
```

### Score Interpretation

| Score Range | Verdict | Meaning |
|------------|---------|---------|
| **≥ 70%** | ✅ EXCELLENT | High correctness - Production-ready |
| **50-69%** | ✔️ GOOD | Acceptable similarity - Minor differences |
| **30-49%** | ⚠️ MODERATE | Needs improvement - Significant differences |
| **< 30%** | ❌ POOR | Low correctness - Major differences |

---

## 10. Configuration

### Environment Variables (.env)

```bash
# Groq API Configuration
GROQ_API_KEY=gsk_your_api_key_here          # Required
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile

# Server Configuration
HOST=127.0.0.1
PORT=8000
```

### Available Models

**Groq Supported Models:**

- `llama-3.3-70b-versatile` (default) - Best for code
- `llama-3.1-70b-versatile` - Alternative
- `mixtral-8x7b-32768` - Long context

### Port Configuration

**Default Ports:**

- Frontend: `5500` (can change with `FRONTEND_PORT=8080`)
- Backend: `8000` (can change with `PORT=8001`)

---

## 11. Security & Best Practices

### 11.1 Security Measures

✅ **API Key Protection:**

- Stored in `.env` (server-side only)
- Never exposed to browser
- Masked in API responses: `gsk_****abc123`

✅ **Input Sanitization:**

- Filename sanitization prevents path traversal
- Pydantic validation on all inputs

✅ **CORS Configuration:**

```python
# Development: Allow all origins
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Production: Restrict to specific domains
app.add_middleware(CORSMiddleware, allow_origins=["https://yourdomain.com"])
```

### 11.2 Performance Optimizations

⚡ **Async/Await:**

- All LLM calls use `async`/`await`
- Non-blocking I/O with httpx.AsyncClient

⚡ **Temperature Tuning:**

- Code generation: 0.1 (faster, deterministic)
- Chat mode: 0.7 (creative but slower)

⚡ **Token Limits:**

- Code generation: 2048 tokens (larger responses)
- Chat mode: 1024 tokens (concise answers)

### 11.3 Error Handling

**Graceful Degradation:**

```python
try:
    result = await client.chat(messages, temperature, max_tokens)
    if result["status"] != 200:
        return CodeGenResponse(error=f"LLM Error {result['status']}")
except Exception as e:
    return CodeGenResponse(error=f"Code generation failed: {str(e)}")
```

**Frontend Error Display:**

- Network errors shown in chat
- API errors displayed with error icon
- Verification errors shown in verification panel

---

## 12. Code Examples

### 12.1 Testing Chat Endpoint (curl)

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quicksort in simple terms"}
    ]
  }'
```

### 12.2 Testing Code Generation (curl)

```bash
curl -X POST http://127.0.0.1:8000/api/generate_code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "write a fibonacci function in Python",
    "language": "python",
    "temperature": 0.1
  }'
```

### 12.3 Testing Verification (curl)

```bash
curl -X POST http://127.0.0.1:8000/api/verify_code \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "def fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)",
    "candidate": "def fib(n):\n    if n < 2:\n        return n\n    return fib(n-1) + fib(n-2)",
    "language": "python",
    "normalize": true
  }'
```

### 12.4 Browser Console Testing

```javascript
// Test health
ChatDebug.health()

// Test verification
const ref = "def factorial(n):\n    return math.factorial(n)";
const gen = "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)";
ChatDebug.verify(ref, gen)

// Check conversation state
ChatDebug.state()

// View last generated code
ChatDebug.code()
```

---

## 🎓 Summary

This AI Code Assistant is a **production-ready prototype** demonstrating:

✅ **Dual-Mode AI**: Conversational chat vs. strict code generation  
✅ **Automated Verification**: CodeBLEU-based correctness measurement  
✅ **Clean Architecture**: Separation of concerns (frontend/backend/utils)  
✅ **Security**: API keys server-side, input validation, CORS protection  
✅ **User Experience**: Beautiful UI, theme persistence, download functionality  
✅ **Industry Standards**: 70% CodeBLEU threshold, temperature optimization  

**Built by:** Mahir, Rafid & Mehedi  
**Powered by:** Groq LLM (llama-3.3-70b-versatile)  
**Purpose:** SPM Course Project - AI-Assisted Development Tools
