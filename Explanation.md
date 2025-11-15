# AI Chatbot

An AI-powered conversational assistant leveraging the Groq LLM API. Reengineered by Mahir, Rafid & Mehedi.

---

## 1. Non‑Technical Overview (Plain English)

Think of this chatbot like a helpful digital assistant sitting in a chat window:
- You type a question in the box and press Send.
- Your message is packaged and sent to a smart brain (Groq's language model) on the internet.
- That brain reads the whole conversation so far (not just the last message), thinks, and writes a reply.
- The reply comes back and is shown as a bubble. You ask again, it learns the context and continues smoothly.
- You can switch between Light and Dark mode with the toggle button – the look changes but the brain is the same.

You do NOT need to understand how AI itself works to use it. You only need an API key (a secret password) that tells the Groq server “allow this user to ask questions.”

---
## 2. High-Level Flow (Conceptual)
1. User types a message and hits Enter / Send.
2. Frontend adds your message to a local list called `conversationHistory`.
3. That list is sent to Groq’s API as `messages`.
4. Groq returns a response containing the assistant’s reply.
5. The reply is added back into `conversationHistory` and rendered.
6. Scroll moves to bottom for continuity.
7. Repeat.

---
## 3. Technical Architecture Deep Dive
### 3.1 Files & Responsibilities
| File | Role |
|------|------|
| `index.html` | Structural skeleton of the chat app and theme toggle button |
| `css/style.css` | Visual design, themes (light/dark), layout, animations |
| `config/api.js` | Holds API endpoint, model name, and API key (DO NOT expose publicly) |
| `js/main.js` | Core logic: theme control, message rendering, API calls, markdown formatting |

### 3.2 Core Data Structure
`conversationHistory` (Array of objects):
```js
[
  { role: "system", content: "You are AI..." },
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi! How can I help?" }
]
```
Each object has:
- `role`: `system` | `user` | `assistant`
- `content`: plain text the model sees

The entire array is sent every request so the model keeps context.

### 3.3 Theme Management
Functions: `initTheme()` + `toggleTheme()`
- Reads saved value from `localStorage` (`light` or `dark`).
- Applies it to `<html data-theme="...">` which switches CSS variables.
- User toggle persists between page reloads.

### 3.4 Sending a Message
Function: `sendMessage()`
Steps:
1. Get current input value.
2. Ignore if empty.
3. Render user bubble via `addMessage(text, "user")`.
4. Push to `conversationHistory`.
5. Clear input.
6. Call `callLLM()`.

### 3.5 Calling Groq API
Function: `callLLM()`
Workflow:
1. Disable Send button (prevent double submits).
2. Show temporary "typing" bubble.
3. POST to `API_CONFIG.url` with JSON body:
   - `model`: e.g. `llama-3.1-70b-versatile`
   - `messages`: entire `conversationHistory` array.
   - `temperature`, `max_tokens` (tuning generation style).
4. If HTTP error → show error bubble (`Groq Error 4xx/5xx`).
5. If success: parse JSON → `data.choices[0].message.content`.
6. Add assistant message + push to history.
7. Re-enable Send button.

### 3.6 Rendering Messages
Function: `addMessage(content, role)`
- Creates a `<div class="message {role}">`.
- If role is `typing` adds animated placeholder.
- Otherwise runs a small markdown formatter (bold, italics, code blocks, lists, headings) using regex replacements.
- Appends bubble → smooth scroll to bottom.

### 3.7 Markdown Formatting (Simplified)
Regex transforms examples:
| Raw | Rendered |
|-----|----------|
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `inline` `` | styled `<code>` block |
| ``` ```
```code here``` | full-width monospace block |
| `- item` | bullet line with accent border |
| `### Title` | styled heading |

Potential Pitfall: Regex order matters (e.g., bold before italics). For production scale, consider a library like `marked` or `markdown-it` instead of multiple regex chains.

### 3.8 Error Handling
- Network failure → catch block: shows `Network error: ...`.
- Invalid config (missing key/model/url) → early throw.
- API non-200 → extracts raw body text for debugging.

### 3.9 Performance Notes
- Conversation history grows; for very long chats you might truncate earlier messages.
- Regex formatting is OK for short messages; heavy content could be optimized.
- No debounce on sending; user can flood requests if spamming (rate limit risk).

### 3.10 Security Considerations
- API key currently lives in client-side JS (`config/api.js`): any user could view it in DevTools. For real deployment you MUST proxy through a backend server and keep the key secret.
- Avoid exposing system prompts with sensitive data.

### 3.11 Accessibility & UX
- Keyboard: Enter sends, Shift+Enter (future enhancement) could create multiline.
- Color contrast meets readability standards in both themes.
- Focus ring on input improves usability.

---
## 4. Detailed Execution Sequence (Pseudo Flow)
```text
User presses Send
  ↓
sendMessage()
  → addMessage(user)
  → conversationHistory.push(user)
  → callLLM()
      ↓ show typing bubble
      ↓ fetch() POST messages
      ↓ success? yes → parse JSON
            → addMessage(assistant)
            → conversationHistory.push(assistant)
      ↓ success? no → addMessage(error)
  → re-enable send button
```

---
## 5. How To Extend (Suggestions)
| Goal | Suggestion |
|------|------------|
| Prevent API abuse | Add request queue + disable while pending |
| Better formatting | Use a markdown library instead of regex |
| Longer chats | Implement message summarization or trimming |
| Save sessions | Persist `conversationHistory` to `localStorage` or backend |
| Multi-model support | Dropdown to choose model before sending |
| Streaming replies | Use Fetch streaming / Server-Sent Events for token-by-token output |
| Mobile UX | Auto-expand input to multiple lines; add send-on-swipe |
| Accessibility | Add ARIA roles to message list & announce typing status |
| Privacy | Move API call server-side to hide API key |
| User avatars | Add simple avatar circles for user / AI roles |

---
## 6. Common Concepts Explained
| Concept | Meaning |
|---------|---------|
| API Key | Secret credential to call Groq’s servers |
| Model | Specific AI brain version (e.g., `llama-3.1-70b-versatile`) |
| Temperature | Controls creativity (lower = focused, higher = imaginative) |
| Max Tokens | Upper bound for reply length |
| System Prompt | Initial hidden instruction shaping personality |
| Role | Who wrote a message (`system`, `user`, `assistant`) |
| Context | Entire conversation history sent every time |

---
## 7. Quick Start If You “Don’t Know Code”
1. Get API key (follow steps above).
2. Paste key into `config/api.js` replacing placeholder.
3. Double-click `start.sh` (or run the bash command) to launch local server.
4. Open the shown URL → Start typing.
5. Toggle theme with the sun/moon button if you prefer dark mode.
6. If it stops working → open DevTools Console (Ctrl+Shift+I) and read the error bubble.

---
## 8. Safety Checklist Before Sharing
- [ ] Remove / secure real API key
- [ ] Write a short privacy notice (no personal data logging)
- [ ] Add rate limiting if public
- [ ] Consider disclaimers (accuracy, not a substitute for professional advice)

---
## 9. Code Reading Map (Fast Reference)
| Function | Why It Exists |
|----------|---------------|
| `initTheme` | Loads saved theme preference |
| `toggleTheme` | Switches theme + persists preference |
| `addMessage` | Renders any bubble (user / ai / typing) |
| `sendMessage` | Handles input → triggers API call |
| `callLLM` | Orchestrates request/response lifecycle |

---
## 10. Future Upgrade Ideas
- Add voice input (Web Speech API)
- Add “Regenerate response” button using last user message
- Add message editing → re-submit modified user message
- Add copy button for each AI message
- Add token usage display (approximate) per response
- Add skeleton loader for streaming

---
## 11. Minimal Internal Contract
Inputs: user text (string) → Output: assistant text (string)
Errors surfaced as readable bubbles; system never hard-crashes silently.

---
## 12. Limitations
- Entire conversation re-sent each time (inefficient for huge chats)
- Client-side key exposure
- No streaming (full response waits)
- Basic markdown; complex tables not supported

---
## 13. Maintenance Tips
- Keep dependencies minimal (currently none)
- Rotate API key periodically
- Log errors meaningfully if adding backend
- Version control large UI changes separately

---
## 14. Glossary Quick Link
See Section 6 above for fast term meanings.
