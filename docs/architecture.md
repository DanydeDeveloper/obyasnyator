# Объяснятор — Technical Architecture

## Stack

### Frontend
- **Next.js + React + Tailwind**
- Быстро собрать polished веб-продукт
- Удобно сделать layout "document + tutor panel"
- Легко добавить upload, tabs, cards, flashcards, quiz flow

### Backend
- **Next.js Route Handlers** (единый стек, рекомендуется)
- Альтернатива: FastAPI, если нужна более явная AI/backend-логика

### AI
- **Claude API** (Anthropic) — основной tutor engine
- Модели: claude-sonnet-4-6 для основных запросов, claude-haiku-4-5 для простых/быстрых

---

## Core Pipeline

### 1. Ingestion Layer
Принимает:
- PDF
- PPT/PPTX или extracted text
- plain text / markdown

### 2. Parsing Layer
- PDF → text (pdf-parse или pdfjs)
- slides → text blocks
- metadata extraction
- chunking по разделам / страницам / заголовкам

### 3. Knowledge Layer
- embeddings (OpenAI или Voyage AI)
- vector store (Pinecone / Supabase pgvector / in-memory для MVP)
- search по чанкам
- retrieval для tutor-ответов (RAG)

### 4. Tutor Engine
- system prompt для режима tutor
- question answering over notes
- Socratic mode
- explain mode
- quiz mode
- flashcard generation
- practice problem generation

### 5. Notes Layer
- user notes (localStorage или DB)
- saved AI outputs
- session summary
- export в markdown / PDF

### 6. Optional Visual Layer (V2)
- concept map / outline generator
- simplified diagram blocks (Mermaid?)

---

## Data Flow

```
User uploads file
      ↓
Parsing Layer (extract text, chunk)
      ↓
Knowledge Layer (embed, store in vector DB)
      ↓
User interacts with Tutor Panel
      ↓
Tutor Engine (retrieve relevant chunks → Claude API → response)
      ↓
Response rendered in UI
      ↓
User saves to Study Notes
```

---

## MVP Simplifications

Для первой версии можно упростить Knowledge Layer:
- Хранить extracted text целиком в контексте (если документ небольшой < 100k tokens)
- Добавить RAG только когда документы станут большими

Это позволяет запустить MVP без настройки vector DB.

---

## File Structure (Next.js)

```
obyasnyator/
├── app/
│   ├── page.tsx              # Landing / Upload
│   ├── workspace/
│   │   └── [docId]/
│   │       └── page.tsx      # Main workspace
│   └── api/
│       ├── upload/route.ts   # File ingestion
│       ├── tutor/route.ts    # AI tutor responses
│       ├── flashcards/route.ts
│       ├── quiz/route.ts
│       └── notes/route.ts
├── components/
│   ├── DocumentViewer/
│   ├── TutorPanel/
│   ├── MaterialsSidebar/
│   ├── FlashcardModal/
│   ├── QuizModal/
│   └── StudyNotes/
├── lib/
│   ├── pdf-parser.ts
│   ├── chunker.ts
│   ├── embeddings.ts
│   └── claude.ts
└── docs/                     # Project context (этот каталог)
```
