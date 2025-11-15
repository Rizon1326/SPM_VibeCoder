# AI Chatbot Chatbot

A modern chatbot powered by Groq LLM with a clean UI and a Python FastAPI backend.

## Features
- Clean and modern chat interface with **Light/Dark theme toggle**
- Powered by Groq's fast LLM models
- Conversation history maintained
- Real-time responses
- Theme preference saved in browser
- Beautiful color schemes for both themes

## Prerequisites
- Python 3.8+
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Groq API key (free tier available)

## Setup Instructions

### 1. Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy your API key

### 2. Configure the API Key
```bash
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key_here
```

### 3. Run the Project (Backend + Frontend)
```bash
chmod +x start.sh
./start.sh
```

This starts:
- Frontend: http://127.0.0.1:5500/index.html
- Backend:  http://127.0.0.1:8000 (docs at /docs)

---

#### Alternative Options:

**Option A: Start Backend Only**
```bash
python3 -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

**Option B: Start Frontend Only**
```bash
python3 -m http.server 5500
open http://127.0.0.1:5500/index.html
```

**Option C: Using Node.js (if installed)**
```bash
npm install -g http-server
http-server -p 5500
```

**Option D: Using VS Code Live Server Extension**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage
1. Type your message in the input box at the bottom
2. Click "Send" or press Enter
3. Wait for the AI to respond
4. Continue the conversation!

## Troubleshooting

### Port Already in Use (Error: Address already in use)
If you get `OSError: [Errno 98] Address already in use`:

**Solution 1: Use the start.sh script** (handles this automatically)
```bash
./start.sh
```

**Solution 2: Manually free the port**
```bash
# Find and kill process using port 5500
lsof -ti:5500 | xargs kill -9

# Then start the server
python3 -m http.server 5500
```

**Solution 3: Use a different port**
```bash
# Use port 8000 instead
python3 -m http.server 8000
# Open: http://127.0.0.1:8000/index.html
```

### Backend not reachable / CORS
- Ensure backend is running on port 8000
- Use `ChatDebug.health()` in the browser console
 
### Unauthorized / Empty responses
- Verify `.env` exists and `GROQ_API_KEY` is set
- Restart backend after changing `.env`

### Network Error
- Check your internet connection
- Verify the API endpoint is correct
- Check browser console for detailed errors

## Project Structure
```
SPM_VibeCoder/
├── backend/
│   ├── __init__.py
│   ├── app.py         # FastAPI app
│   ├── config.py      # Settings loader (.env)
│   ├── models.py      # Pydantic models
│   └── llm_client.py  # Groq client (httpx)
├── requirements.txt   # Python deps
├── .env.example       # Env template
├── start.sh           # Launch frontend+backend
├── index.html         # Frontend UI
├── css/
│   └── style.css
└── js/
	└── main.js
```

## Security Note
⚠️ Never expose API keys in frontend. Keys are now stored in `.env` and used server-side only.

## Credits
Reengineered by: Mahir, Rafid & Mehedi  
Powered by: Groq LLM

## License
Educational project for SPM course
