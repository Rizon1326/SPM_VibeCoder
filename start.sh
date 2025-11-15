#!/bin/bash
# Start both frontend (static) and backend (FastAPI)
set -e

FRONTEND_PORT=${FRONTEND_PORT:-5500}
BACKEND_PORT=${BACKEND_PORT:-8000}
HOST=${HOST:-127.0.0.1}

echo "========================================="
echo "  AI Chatbot"
echo "  Starting Frontend & Backend..."
echo "========================================="
echo ""

# Ensure .env exists
if [ ! -f .env ]; then
	if [ -f .env.example ]; then
		cp .env.example .env
		echo "⚠️  Created .env from template. Edit it to add your GROQ_API_KEY."
	else
		echo "⚠️  .env.example missing. Please create .env with GROQ_API_KEY first."
	fi
fi

# Free ports
for port in $FRONTEND_PORT $BACKEND_PORT; do
	if lsof -ti:${port} >/dev/null 2>&1; then
		echo "Killing process on port ${port}..."
		lsof -ti:${port} | xargs -r kill -9 || true
	fi
done

# Install deps if needed
if ! python3 -c "import fastapi, httpx, pydantic" 2>/dev/null; then
	echo "Installing Python dependencies..."
	pip install -r requirements.txt
fi

cleanup() {
	echo "\nStopping servers..."
	kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM

echo "Starting backend on http://${HOST}:${BACKEND_PORT}"
python3 -m uvicorn backend.app:app --host ${HOST} --port ${BACKEND_PORT} --reload &
BACKEND_PID=$!

sleep 2

echo "Starting frontend on http://${HOST}:${FRONTEND_PORT}"
python3 -m http.server ${FRONTEND_PORT} &
FRONTEND_PID=$!

echo "\nFrontend: http://${HOST}:${FRONTEND_PORT}/index.html"
echo "Backend:  http://${HOST}:${BACKEND_PORT}"
echo "Docs:     http://${HOST}:${BACKEND_PORT}/docs"
echo "\nPress Ctrl+C to stop both."

wait
