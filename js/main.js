// js/main.js - STRICT CODE GENERATION MODE
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');
const codeGenBtn = document.getElementById('codeGenBtn');
const codeBleuBtn = document.getElementById('codeBleuBtn');

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

// Track last generated code for CodeBLEU verification
let lastGeneratedCode = null;

function addMessage(content, role, code = null) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  
  if (role === 'typing') {
    msgDiv.className = 'message ai typing';
    msgDiv.innerHTML = '<span class="typing-dots"></span>';
  } else {
    // Enhanced markdown rendering for perfect readability with proper code block support
    let formatted = content;
    
    // Extract and replace code blocks with properly formatted ones
    const codeBlockRegex = /```(?:(\w+))?\n?([\s\S]+?)```/g;
    let codeBlockCounter = 0;
    const codeBlocks = [];
    
    formatted = formatted.replace(codeBlockRegex, (match, language, codeContent) => {
      const blockId = `code-block-${Date.now()}-${codeBlockCounter++}`;
      codeBlocks.push({ id: blockId, code: codeContent.trim(), language: language || 'python' });
      return `<div class="code-block-wrapper" id="${blockId}"></div>`;
    });
    
    // Apply other markdown formatting
    formatted = formatted
      // Headers (### Title)
      .replace(/###\s+(.+?)(?:\n|$)/g, '<strong style="display: block; font-size: 1.1em; margin: 12px 0 8px 0; color: var(--text-primary);">$1</strong>')
      // Bold (**text**)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic (*text*)
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
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
    
    // Add properly formatted code blocks with download buttons
    codeBlocks.forEach(({ id, code, language }) => {
      const wrapper = msgDiv.querySelector(`#${id}`);
      if (wrapper) {
        const ext = getFileExtension(language);
        wrapper.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 8px 12px; border-radius: 8px 8px 0 0; border-bottom: 1px solid var(--border-color);">
            <span style="font-size: 0.8em; color: var(--text-tertiary); font-weight: 600;">${language.toUpperCase()} CODE</span>
            <button class="download-code-btn" data-code="${escapeHtml(code)}" data-ext="${ext}">
              📥 Download .${ext}
            </button>
          </div>
          <pre class="code-block"><code>${escapeHtml(code)}</code></pre>
        `;
        
        // Add download functionality
        const downloadBtn = wrapper.querySelector('.download-code-btn');
        downloadBtn.addEventListener('click', () => {
          const filename = `generated_code.${ext}`;
          downloadCode(code, filename);
        });
      }
    });
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFileExtension(language) {
  const extensions = {
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'cs',
    'go': 'go',
    'rust': 'rs',
    'php': 'php',
    'ruby': 'rb',
    'swift': 'swift',
    'kotlin': 'kt'
  };
  return extensions[language.toLowerCase()] || 'txt';
}

async function downloadCode(code, filename = 'generated_code.py') {
  try {
    // Create blob and download client-side
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Code downloaded as ${filename}`);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Failed to download code: ' + err.message);
  }
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
  conversationHistory.push({ role: "user", content: text });
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

// Code Generation Feature - STRICT CODE ONLY MODE
async function generateCode() {
  const prompt = userInput.value.trim();
  if (!prompt) return;
  
  addMessage(prompt, "user");
  userInput.value = "";
  sendBtn.disabled = true;
  codeGenBtn.disabled = true;
  addMessage("", "typing");
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/generate_code', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        language: detectLanguage(prompt),
        temperature: 0.1  // Very low for maximum correctness
      })
    });
    
    const data = await response.json();
    document.querySelector('.message.typing')?.remove();
    
    if (data.error) {
      addMessage(`⚠️ Error: ${data.error}`, "ai");
    } else if (data.code) {
      lastGeneratedCode = data.code;
      
      // Show ONLY the code - no metadata, no explanations
      const codeLanguage = data.metadata?.language || 'python';
      addMessage(`\`\`\`${codeLanguage}\n${data.code}\n\`\`\``, "ai");
      
      console.log('✅ Code generated (strict mode - code only)');
      console.log(`📊 Model: ${data.metadata?.model}, Latency: ${data.metadata?.latencyMs}ms, Temp: ${data.metadata?.temperature}`);
    } else {
      addMessage("❌ No code generated.", "ai");
    }
  } catch (err) {
    document.querySelector('.message.typing')?.remove();
    addMessage("❌ Code generation error: " + err.message, "ai");
    console.error(err);
  }
  
  sendBtn.disabled = false;
  codeGenBtn.disabled = false;
  userInput.focus();
}

// Detect programming language from user prompt
function detectLanguage(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('python') || lower.includes('.py')) return 'python';
  if (lower.includes('java') && !lower.includes('javascript')) return 'java';
  if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
  if (lower.includes('javascript') || lower.includes('js')) return 'javascript';
  if (lower.includes('typescript') || lower.includes('ts')) return 'typescript';
  if (lower.includes('go') || lower.includes('golang')) return 'go';
  if (lower.includes('rust')) return 'rust';
  if (lower.includes('c#') || lower.includes('csharp')) return 'csharp';
  return 'python'; // Default to Python
}

codeGenBtn.addEventListener('click', generateCode);

// CodeBLEU Verification Tool - Automated Code Correctness Checker
function openCodeBleuPanel() {
  const panel = document.getElementById('codebleu-panel');
  if (!panel.classList.contains('visible')) {
    panel.classList.add('visible');
    
    // Auto-fill generated code if available
    if (lastGeneratedCode) {
      document.getElementById('generated-code-input').value = lastGeneratedCode;
    }
  } else {
    panel.classList.remove('visible');
  }
}

async function calculateCodeBLEU() {
  const generatedCode = document.getElementById('generated-code-input').value.trim();
  const referenceCode = document.getElementById('reference-code-input').value.trim();
  const resultDiv = document.getElementById('codebleu-result');
  
  if (!generatedCode || !referenceCode) {
    resultDiv.innerHTML = '<p style="color: var(--text-tertiary);">⚠️ Please provide both AI-generated code and reference code for verification.</p>';
    return;
  }
  
  resultDiv.innerHTML = '<p style="color: var(--text-tertiary);">⏳ Verifying code correctness with CodeBLEU...</p>';
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/verify_code', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate: generatedCode,
        reference: referenceCode,
        language: "python",
        normalize: true
      })
    });
    
    const data = await response.json();
    
    if (!data.available) {
      resultDiv.innerHTML = `<p style="color: #f44336;">❌ Verification unavailable: ${data.error}</p>`;
      return;
    }
    
    if (data.error) {
      resultDiv.innerHTML = `<p style="color: #f44336;">❌ Error: ${data.error}</p>`;
      return;
    }
    
    // Display results with industry-standard interpretation
    const score = data.score;
    let verdict, verdictColor, verdictIcon;
    
    if (score >= 0.7) {
      verdict = "EXCELLENT - High Correctness ✓";
      verdictColor = "#4caf50";
      verdictIcon = "✅";
    } else if (score >= 0.5) {
      verdict = "GOOD - Acceptable Similarity";
      verdictColor = "#8bc34a";
      verdictIcon = "✔️";
    } else if (score >= 0.3) {
      verdict = "MODERATE - Needs Improvement";
      verdictColor = "#ff9800";
      verdictIcon = "⚠️";
    } else {
      verdict = "POOR - Low Correctness";
      verdictColor = "#f44336";
      verdictIcon = "❌";
    }
    
    resultDiv.innerHTML = `
      <div style="margin-bottom: 16px; padding: 16px; background: var(--input-bg); border-radius: 8px; border-left: 4px solid ${verdictColor};">
        <h3 style="margin: 0 0 8px 0; color: ${verdictColor}; font-size: 1.1em;">${verdictIcon} ${verdict}</h3>
        <div style="font-size: 2.5em; font-weight: bold; color: ${verdictColor};">${(score * 100).toFixed(1)}%</div>
        <p style="margin: 8px 0 0 0; font-size: 0.85em; color: var(--text-secondary);">
          CodeBLEU Correctness Score
        </p>
      </div>
      
      <div style="background: var(--bg-messages); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 0.95em;">Component Breakdown:</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="score-component">
            <strong>N-gram Match:</strong>
            <span>${(data.ngram_match * 100).toFixed(1)}%</span>
          </div>
          <div class="score-component">
            <strong>Weighted N-gram:</strong>
            <span>${(data.weighted_ngram_match * 100).toFixed(1)}%</span>
          </div>
          <div class="score-component">
            <strong>Syntax Match:</strong>
            <span>${(data.syntax_match * 100).toFixed(1)}%</span>
          </div>
          <div class="score-component">
            <strong>Dataflow Match:</strong>
            <span>${(data.dataflow_match * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div style="background: var(--input-bg); padding: 12px; border-radius: 6px; font-size: 0.85em; color: var(--text-secondary);">
        <strong>Industry Standard:</strong> Score ≥ 70% indicates production-ready code with high correctness.
        ${score >= 0.7 ? '🎉 Your AI-generated code meets industry standards!' : '💡 Consider regenerating or manually refining the code.'}
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p style="color: #f44336;">❌ Network error: ${err.message}</p>`;
    console.error(err);
  }
}

codeBleuBtn.addEventListener('click', openCodeBleuPanel);
document.getElementById('calculate-codebleu-btn').addEventListener('click', calculateCodeBLEU);
document.getElementById('close-codebleu-btn').addEventListener('click', () => {
  document.getElementById('codebleu-panel').classList.remove('visible');
});

window.onload = () => userInput.focus();

// Debug toolkit for browser console
window.ChatDebug = {
  memory: () => {
    console.log("💬 Conversation History:");
    conversationHistory.forEach((m, i) => console.log(`[${i}] ${m.role}:`, m.content));
    return conversationHistory;
  },
  last: () => conversationHistory[conversationHistory.length - 1],
  code: () => lastGeneratedCode,
  config: async () => (await fetch('http://127.0.0.1:8000/api/config')).json(),
  health: async () => (await fetch('http://127.0.0.1:8000/api/health')).json(),
  verify: async (ref, gen) => {
    const res = await fetch('http://127.0.0.1:8000/api/verify_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, candidate: gen, language: 'python', normalize: true })
    });
    return res.json();
  },
  state: () => ({
    count: conversationHistory.length,
    theme: document.documentElement.getAttribute('data-theme'),
    last: conversationHistory[conversationHistory.length - 1],
    lastCode: lastGeneratedCode
  }),
  inject: (role, content) => { conversationHistory.push({ role, content }); addMessage(content, role); },
  clear: () => {
    conversationHistory = [
      { role: "system", content: "You are AI, a helpful and concise assistant. Use brief paragraphs and markdown when useful." }
    ];
    lastGeneratedCode = null;
    document.getElementById('messages').innerHTML = '<div class="message ai">👋 Hi! I\'m your AI Code Assistant. Click <strong></> Code</strong> for strict code generation.</div>';
  }
};
console.log("🐛 ChatDebug ready: try ChatDebug.verify(refCode, genCode)");
