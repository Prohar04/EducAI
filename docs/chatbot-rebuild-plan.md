# Chatbot Rebuild Plan

**Date:** 2026-04-12

---

## Current State

The chatbot system has three layers:

1. **Express route**: `POST /chat/message` — injects user profile + saved programs context, proxies to ai-server
2. **AI server chat endpoint**: `POST /api/v1/chat/message` — web search + page scraping + DB context + LLM
3. **Frontend**: `ChatbotWidget` floating drawer + `/app/agent` full-page chat

### What Works Well
- Profile context injection (GPA, level, country, budget)
- Web search via Serper with result citation
- Page scraping via Firecrawl for deep content
- Internal DB context (programs, scholarships)
- Source-cited responses

### Known Gaps
- In-memory `SEARCH_CACHE` and `PAGE_CACHE` (not persistent across server restarts)
- Agent page needs a full-screen layout (not just a floating widget)
- No conversation history beyond current session
- No streaming (waits for full LLM response)
- ChatbotWidget close/open state doesn't persist across navigation

---

## What is Preserved

- All LLM chat logic in `ai-server/app/api/v1/chat.py`
- Profile context injection pattern
- Web search + Firecrawl scrape integration
- Source citation format
- `POST /chat/message` route in Express

---

## What is Enhanced

### 1. Agent Page Layout (Phase 5)
- Full-screen chat interface with proper two-column layout
- Left sidebar: conversation context (profile summary, saved programs count)
- Right panel: chat messages with source citations
- Sticky input bar at bottom
- Message bubbles with proper sender attribution

### 2. ChatbotWidget Hardening (Phase 5)
- Preserve open/close state in sessionStorage
- Show typing indicator while LLM generates
- Auto-scroll to latest message
- Clear chat button with confirmation
- Error state with retry button

### 3. Conversation Context (Phase 5)
- Pass last N messages as history to the LLM call
- Store conversation in sessionStorage (not DB — no server cost)
- "New conversation" clears history

### 4. Response Quality (Phase 5)
- System prompt emphasizes EducAI context (university search assistant)
- Refuse off-topic requests gracefully
- Always cite sources when using web search

---

## Architecture (unchanged core, enhanced wrapping)

```
User types message
    │
    ▼
ChatbotWidget / AgentPage
    │  POST /chat/message {message, conversationHistory}
    ▼
Express chat route
    │  injects profile + saved programs context
    │  POST to ai-server /api/v1/chat/message
    ▼
FastAPI chat endpoint
    │  1. Check in-memory page cache (15 min TTL)
    │  2. Web search (Serper) if needed
    │  3. Scrape relevant pages (Firecrawl)
    │  4. Build context (profile + programs + search results)
    │  5. LLM generate response with sources
    ▼
Return {message, sources, webResultsUsed}
    │
    ▼
Frontend renders response with source chips
```

---

## Success Criteria

- [ ] Chat sends message and receives LLM response
- [ ] Agent page shows full-screen layout
- [ ] Sources are displayed with clickable links
- [ ] Profile context is injected (LLM knows user's GPA, target country)
- [ ] Typing indicator shows while waiting
- [ ] Error state shown if chat fails
- [ ] Widget persists open state across navigation
