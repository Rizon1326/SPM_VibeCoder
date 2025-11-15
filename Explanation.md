# AI Chatbot — Project Explanation

An AI-powered conversational assistant with a clean web UI (HTML/CSS/JS) and a Python FastAPI backend calling the Groq LLM API. Reengineered by Mahir, Rafid & Mehedi.

---

## 1) Plain‑English Overview
- You type a prompt and press Send.
- The browser sends the whole conversation (messages) to the local Python backend.
- The backend calls Groq’s model with your conversation and returns the reply.
- The UI renders the assistant’s response as a chat bubble. You repeat.
- Light/Dark theme can be toggled anytime.

Key point: your API key lives on the server (.env), not in the browser.

---

## 2) Architecture (What lives where)
- Frontend (static): `index.html`, `css/style.css`, `js/main.js`
  - Renders chat UI, manages theme, stores `conversationHistory`, calls backend.
- Backend (Python): `backend/`
  - `backend/app.py` — FastAPI app with endpoints `/api/chat`, `/api/health`, `/api/config`
  - `backend/models.py` — Pydantic models: `Message`, `ChatRequest`, `ChatResponse`
  - `backend/llm_client.py` — Async httpx client for Groq API
  - `backend/config.py` — Loads `.env` (GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL)
- Startup: `start.sh` runs both servers (frontend on 5500, backend on 8000)
- Dependencies: `requirements.txt`
- Environment template: `.env.example`

---

## 3) Message Contract (Core data)
`Message`: `{ role: "system" | "user" | "assistant", content: string }`

Frontend keeps an array `conversationHistory` like:
```json
[
  { "role": "system", "content": "You are AI..." },
  { "role": "user", "content": "Hello" },
  { "role": "assistant", "content": "Hi! How can I help?" }
]
```
Every time you send a message, the full array is POSTed to the backend.

---

## 4) Request Flow (End‑to‑end)
1) User sends text → `sendMessage()` pushes to `conversationHistory` → calls `callLLM()`.
2) Frontend POSTs to `http://127.0.0.1:8000/api/chat` with `{ messages: [...] }`.
3) Backend validates, builds Groq payload and calls Groq via httpx.
4) Backend extracts the assistant content and responds: `{ reply: "...", error: null }`.
5) Frontend renders the reply, scrolls to bottom, re‑enables Send.

---

## 5) API Endpoints (Backend)
- GET `/api/health` → `{ status: "ok", model: "...", api_configured: true|false }`
- GET `/api/config` → safe config (API key masked)
- POST `/api/chat` → body: `{ messages: Message[] }` → response: `{ reply?: string, error?: string }`

Example curl (chat):
```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## 6) Environment (.env)
From `.env.example` (edit `.env`):
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
HOST=127.0.0.1
PORT=8000
```
Note: the backend has a default, but the `.env` values override it. Keep your API key secret.

---

## 7) How to Run (Local)
```bash
pip install -r requirements.txt
cp .env.example .env    # add your GROQ_API_KEY
chmod +x start.sh
./start.sh
```
Open frontend: http://127.0.0.1:5500/index.html
Backend docs: http://127.0.0.1:8000/docs

---

## 8) Frontend Details
- `initTheme()` / `toggleTheme()` controls the theme (persisted in localStorage).
- `addMessage()` renders bubbles with simple markdown (bold, italic, code, lists, headers).
- `callLLM()` now calls the Python backend (no more client‑side API key).
- Console helpers: `ChatDebug.health()`, `ChatDebug.config()`, `ChatDebug.memory()`, `ChatDebug.clear()`.

---

## 9) Security & Performance
- API key is server‑side only (in `.env`). Never expose it in JS.
- Whole conversation is sent each time; consider trimming/summarization for long chats.
- Regex markdown is fine for typical messages; heavy docs may need a proper markdown parser.

---

## 10) Folder Structure (at a glance)
```
SPM_VibeCoder/
├─ backend/
│  ├─ __init__.py
│  ├─ app.py         # FastAPI app
│  ├─ config.py      # .env settings
│  ├─ models.py      # Pydantic models
│  └─ llm_client.py  # Groq client (httpx)
├─ css/style.css
├─ js/main.js
├─ index.html
├─ requirements.txt
├─ .env.example
└─ start.sh
```

---

## 11) Roadmap (easy next steps)
- Streaming responses (SSE) for token‑by‑token output
- Conversation persistence (DB) and history view
- Multi‑model selector & temperature slider
- Auth rate limiting if shared publicly
- Tests (unit/integration) for backend endpoints

---

## 12) Minimal Contract & Limitations
- Input: user text; Output: assistant text.
- Errors returned as `{ error: string }` in responses.
- Limitations: re‑sending full history, non‑streaming replies, simple markdown.

---

## 13) Credits
Built by Mahir, Rafid & Mehedi. Powered by Groq LLM.
