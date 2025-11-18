# 🤖 AI Code Assistant - Strict Code Generator with Automated Verification

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Educational-orange.svg)](LICENSE)

**An industry-grade AI code generator** with **strict code-only output** and **automated CodeBLEU verification** for ensuring code correctness.

🎓 **Built by:** Mahir, Rafid & Mehedi  
⚡ **Powered by:** Groq LLM (llama-3.3-70b-versatile)  
📚 **Purpose:** SPM Course Project

---

## ✨ Key Features

### 💻 Strict Code Generation Mode

- ✅ **Code-Only Output** - NO explanations, NO comments, ONLY executable code
- ✅ **Multi-Language Support** - Python, Java, C++, JavaScript, TypeScript, Go, Rust, C#
- ✅ **Download as Files** - Get `.py`, `.java`, `.cpp` files directly
- ✅ **Temperature 0.1** - Maximum determinism for correct, production-ready code
- ✅ **Smart Extraction** - Automatically removes markdown and explanatory text

### 📊 Automated Code Verification

- 📊 **CodeBLEU Metric** - Industry-standard code similarity measurement
- 📊 **4-Component Analysis** - N-gram, Weighted N-gram, Syntax (AST), Dataflow
- 📊 **Correctness Score** - 70%+ indicates production-ready code
- 📊 **Black Normalization** - Consistent formatting before comparison
- 📊 **Color-Coded Verdicts** - Green (≥70%), Orange (30-70%), Red (<30%)

### 💬 Conversational Chat Mode

- 💬 **General Assistance** - Questions, explanations, brainstorming
- 💬 **Context Memory** - Maintains conversation history throughout session
- 💬 **Markdown Support** - Bold, italic, code blocks, lists, headers
- 💬 **Light/Dark Theme** - Beautiful UI with theme persistence

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (check: `python3 --version`)
- **Groq API Key** ([Get free key](https://console.groq.com/keys))
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Rizon1326/SPM_VibeCoder.git
cd SPM_VibeCoder
```

#### 2. Create Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure API Key

```bash
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=your_key_here
```

**Get your Groq API key:**

1. Visit <https://console.groq.com/keys>
2. Sign up or log in
3. Create a new API key
4. Copy and paste into `.env` file

#### 5. Start the Application

```bash
chmod +x start.sh
./start.sh
```

**This launches:**

- ✅ Frontend: <http://127.0.0.1:5500/index.html>
- ✅ Backend: <http://127.0.0.1:8000>
- ✅ API Docs: <http://127.0.0.1:8000/docs>

---

## 📖 How to Use

### Mode 1: Chat (Conversational)

1. Type your question: *"Explain how binary search works"*
2. Click **"Send"** button
3. Get detailed explanation with examples

### Mode 2: Code Generation (Strict)

1. Type code request: *"write a factorial function in Python"*
2. Click **"💻 Code"** button
3. Get ONLY executable code (no explanations)
4. Click **"📥 Download .py"** to save as file

### Mode 3: Code Verification

1. Click **"📊 Verify"** button to open verification panel
2. Paste **AI-generated code** in top textarea (auto-filled)
3. Paste **reference/expected code** in bottom textarea
4. Click **"🎯 Verify Code Correctness"**
5. View CodeBLEU score with color-coded verdict:
   - 🟢 **Green (≥70%)**: Production-ready
   - 🟠 **Orange (30-70%)**: Needs improvement
   - 🔴 **Red (<30%)**: Low correctness

---

## 🎯 Usage Examples

### Example 1: Generate Python Code

**Prompt:** `write a function to check if a number is prime`

**Click:** 💻 Code

**Output:**

```python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
```

### Example 2: Generate Java Code

**Prompt:** `write a fibonacci method in Java`

**Click:** 💻 Code

**Output:**

```java
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
```

### Example 3: Verify Code Correctness

**Reference Code:**

```python
def factorial(n):
    return math.factorial(n)
```

**Generated Code:**

```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)
```

**Click:** 📊 Verify → **Result:** 73% (✅ EXCELLENT - High Correctness)

---

## 🛠️ Project Structure

```
SPM_VibeCoder/
├── backend/                    # Python FastAPI backend
│   ├── __init__.py
│   ├── app.py                  # Main API (4 endpoints)
│   ├── config.py               # Environment configuration
│   ├── models.py               # Pydantic data models
│   ├── llm_client.py           # Groq API client
│   └── utils/
│       ├── code_utils.py       # Code extraction & sanitization
│       └── codebleu_utils.py   # CodeBLEU verification
├── css/
│   └── style.css               # Theming & responsive design
├── js/
│   └── main.js                 # Frontend logic
├── index.html                  # Main UI
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── start.sh                    # Launch script
└── README.md                   # This file
```

---

## 🔧 Advanced Configuration

### Environment Variables (.env)

```bash
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional (defaults shown)
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
HOST=127.0.0.1
PORT=8000
```

### Alternative Groq Models

```bash
# Default (best for code)
GROQ_MODEL=llama-3.3-70b-versatile

# Alternative models
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MODEL=mixtral-8x7b-32768
```

### Custom Ports

```bash
# Change backend port
PORT=8001

# Change frontend port (in start.sh)
FRONTEND_PORT=8080
```

---

## 🚨 Troubleshooting

### Problem: Port Already in Use

```bash
# Solution 1: Use start.sh (handles this automatically)
./start.sh

# Solution 2: Kill process manually
lsof -ti:5500 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Problem: API Key Not Working

```bash
# Check .env file exists
ls -la .env

# Verify format (no spaces around =)
GROQ_API_KEY=gsk_abc123...

# Restart backend after editing .env
./start.sh
```

### Problem: Backend Not Reachable

```bash
# Check backend is running
curl http://127.0.0.1:8000/api/health

# Expected response:
{"status":"ok","model":"llama-3.3-70b-versatile","api_configured":true}

# Check browser console for errors
# Press F12 → Console tab
ChatDebug.health()
```

### Problem: CodeBLEU Not Working

```bash
# Reinstall CodeBLEU dependencies
pip install --force-reinstall codebleu

# If still failing, check backend logs
# Look for tree-sitter compatibility errors
```

### Problem: "Network Error" in Browser

- ✅ Check internet connection
- ✅ Verify backend is running on port 8000
- ✅ Check browser console (F12) for CORS errors
- ✅ Disable browser extensions that block requests

---

## 🧪 Testing

### Test Backend Health

```bash
curl http://127.0.0.1:8000/api/health
```

### Test Code Generation

```bash
curl -X POST http://127.0.0.1:8000/api/generate_code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "write a hello world function",
    "language": "python",
    "temperature": 0.1
  }'
```

### Test Code Verification

```bash
curl -X POST http://127.0.0.1:8000/api/verify_code \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "def hello():\n    print(\"Hello\")",
    "candidate": "def hello():\n    print(\"Hello\")",
    "language": "python",
    "normalize": true
  }'
```

### Browser Console Testing

```javascript
// Open browser console (F12) and try:
ChatDebug.health()        // Check backend
ChatDebug.config()        // View config
ChatDebug.memory()        // View conversation
ChatDebug.code()          // Get last generated code
```

---

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Backend status |
| `GET` | `/api/config` | Configuration (API key masked) |
| `POST` | `/api/chat` | Conversational chat mode |
| `POST` | `/api/generate_code` | Strict code generation |
| `POST` | `/api/verify_code` | CodeBLEU verification |
| `POST` | `/api/download_code` | Download code as file |

**Full API Documentation:** <http://127.0.0.1:8000/docs>

---

## 🎨 Features Comparison

| Feature | Chat Mode | Code Mode |
|---------|-----------|-----------|
| **Temperature** | 0.7 (creative) | 0.1 (deterministic) |
| **Output** | Explanations + code | ONLY code |
| **Use Case** | Learning, discussion | Production code |
| **Markdown** | Rendered | Stripped |
| **Download** | No | Yes (.py, .java, etc.) |
| **Verification** | No | Yes (CodeBLEU) |

---

## 🔐 Security

- ✅ **API Key Protection**: Stored in `.env` (server-side only), never exposed to browser
- ✅ **Input Validation**: Pydantic models validate all requests
- ✅ **Filename Sanitization**: Prevents path traversal attacks
- ✅ **CORS Protection**: Configurable for production deployment
- ✅ **Error Handling**: Graceful degradation without exposing internals

---

## 📚 Documentation

- **[Explanation.md](Explanation.md)** - Complete technical explanation of the codebase
- **[API Docs](http://127.0.0.1:8000/docs)** - Interactive Swagger documentation (when server is running)

---

## 🤝 Contributing

This is an educational project for SPM course. Contributions and suggestions are welcome!

**Team Members:**

- Mahir
- Rafid
- Mehedi

---

## 📝 License

Educational project - SPM Course

---

## 🙏 Acknowledgments

- **Groq** - For providing fast LLM API
- **FastAPI** - Modern Python web framework
- **CodeBLEU** - Industry-standard code similarity metric

---

## 📞 Support

**For issues:**

1. Check [Troubleshooting](#-troubleshooting) section
2. View browser console (F12) for errors
3. Check backend logs in terminal

**Debug Commands:**

```javascript
// In browser console (F12)
ChatDebug.health()  // Check backend status
ChatDebug.config()  // View configuration
ChatDebug.state()   // View application state
```

---

## 🚀 What Makes This Special?

1. **Strict Separation**: Unlike traditional AI code assistants that mix code with explanations, this tool provides PURE code when you need it

2. **Automated Verification**: Built-in CodeBLEU metric (industry standard) to objectively measure code correctness - no manual checking needed

3. **Multi-Language**: Auto-detects language from your prompt and generates appropriate code with correct file extensions

4. **Production-Ready**: Temperature 0.1 for deterministic code, 6-rule strict prompt engineering, validation checks

5. **Developer-Friendly**: Download code directly, debug toolkit in console, comprehensive error handling

---

**Ready to generate production-quality code? Start the app and click 💻 Code!**

```bash
./start.sh
# Open http://127.0.0.1:5500/index.html
```
