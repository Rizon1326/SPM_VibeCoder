// js/main.js
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Initialize theme on load
initTheme();

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);

// Seed the conversation with a lightweight system prompt for better answers
let conversationHistory = [
  { role: "system", content: "You are AI, a helpful and concise assistant. Use brief paragraphs and markdown when useful." }
];

function addMessage(content, role) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  
  if (role === 'typing') {
    msgDiv.className = 'message ai typing';
    msgDiv.innerHTML = '<span class="typing-dots"></span>';
  } else {
    // Enhanced markdown rendering for perfect readability
    let formatted = content
      // Headers (### Title)
      .replace(/###\s+(.+?)(?:\n|$)/g, '<strong style="display: block; font-size: 1.1em; margin: 12px 0 8px 0; color: var(--text-primary);">$1</strong>')
      // Bold (**text**)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic (*text*)
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks (```code```)
      .replace(/```([\s\S]+?)```/g, '<code style="display: block; background: var(--input-bg); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace; font-size: 0.9em; overflow-x: auto;">$1</code>')
      // Inline code (`code`)
      .replace(/`([^`]+)`/g, '<code style="background: var(--input-bg); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>')
      // Bullet points (- item or * item)
      .replace(/^[\-\*]\s+(.+)$/gm, '<div style="margin-left: 16px; padding-left: 8px; border-left: 2px solid var(--accent); margin: 6px 0;">• $1</div>')
      // Numbered lists (1. item)
      .replace(/^\d+\.\s+(.+)$/gm, '<div style="margin-left: 16px; padding-left: 8px; margin: 6px 0;">$1</div>')
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = formatted;
  }
  
  messagesDiv.appendChild(msgDiv);
  
  // Smooth scroll to bottom
  setTimeout(() => {
    messagesDiv.scrollTo({
      top: messagesDiv.scrollHeight,
      behavior: 'smooth'
    });
  }, 50);
}

async function callLLM() {
  sendBtn.disabled = true;
  addMessage("", "typing");

  try {
    // Call Python FastAPI backend
    const response = await fetch('http://127.0.0.1:8000/api/chat', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Backend Error:", response.status, err);
      document.querySelector('.message.typing')?.remove();
      addMessage(`Backend Error ${response.status}: ${err}`, "ai");
      sendBtn.disabled = false;
      return;
    }

    const data = await response.json();
    document.querySelector('.message.typing')?.remove();

    if (data.error) {
      addMessage(`Error: ${data.error}` , "ai");
    } else if (data.reply) {
      addMessage(data.reply, "ai");
      conversationHistory.push({ role: "assistant", content: data.reply });
    } else {
      addMessage("Empty response from backend.", "ai");
    }
  } catch (err) {
    document.querySelector('.message.typing')?.remove();
    addMessage("Network error: " + err.message, "ai");
    console.error(err);
  }
  sendBtn.disabled = false;
  userInput.focus();
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  conversationHistory.push({ role: "user", content: text });  // store message in history
  userInput.value = "";
  callLLM();
}

userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener('click', sendMessage);

window.onload = () => userInput.focus();

// Debug toolkit for browser console
window.ChatDebug = {
  memory: () => {
    console.log("💬 Conversation History:");
    conversationHistory.forEach((m, i) => console.log(`[${i}] ${m.role}:`, m.content));
    return conversationHistory;
  },
  last: () => conversationHistory[conversationHistory.length - 1],
  config: async () => (await fetch('http://127.0.0.1:8000/api/config')).json(),
  health: async () => (await fetch('http://127.0.0.1:8000/api/health')).json(),
  state: () => ({
    count: conversationHistory.length,
    theme: document.documentElement.getAttribute('data-theme'),
    last: conversationHistory[conversationHistory.length - 1]
  }),
  inject: (role, content) => { conversationHistory.push({ role, content }); addMessage(content, role); },
  clear: () => {
    conversationHistory = [
      { role: "system", content: "You are AI, a helpful and concise assistant. Use brief paragraphs and markdown when useful." }
    ];
    document.getElementById('messages').innerHTML = '<div class="message ai">Hi! I\'m AI. How can I help you?</div>';
  }
};
console.log("🐛 ChatDebug ready: try ChatDebug.health(), ChatDebug.memory()");