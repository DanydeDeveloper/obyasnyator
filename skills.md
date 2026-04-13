# Skills — Объяснятор

Рабочие инструкции и навыки для работы над проектом Объяснятор.
Этот файл помогает держать контекст и быстро ориентироваться в задачах.

---

## Контекст проекта

Документация проекта находится в `/docs/`:
- [product-overview.md](docs/product-overview.md) — что такое продукт, проблема, отличие от "чата с PDF"
- [features.md](docs/features.md) — описание всех фич, что делать/не делать
- [architecture.md](docs/architecture.md) — стек, структура файлов, data flow
- [user-scenarios.md](docs/user-scenarios.md) — аудитория, user journeys, JTBD
- [mvp-scope.md](docs/mvp-scope.md) — скоуп V1, приоритеты, спринты

**Перед началом работы над новой фичей — прочитать соответствующий раздел в docs.**

---

## Работа с AI Tutor

Tutor Engine использует Claude API. Правила промптинга:

### System prompt должен включать:
- Роль: "Ты AI-тьютор. Работаешь только с материалом пользователя."
- Контекст документа (retrieved chunks или full text)
- Режим: explain / quiz / flashcards / practice / socratic
- Язык ответа: русский (если пользователь пишет по-русски)

### Режимы и их поведение:
| Режим | Поведение AI |
|-------|-------------|
| Explain | Объясняет шаг за шагом, ссылается на текст документа |
| Quiz | Задаёт вопрос → ждёт ответ → даёт feedback |
| Flashcards | Возвращает JSON: `[{front, back}]` |
| Practice problems | Возвращает задачи с решениями |
| Socratic | Не даёт ответ сразу, задаёт наводящие вопросы |

### Structured output для карточек и квизов:
Использовать `response_format` или явно просить JSON в промпте, парсить на сервере.

---

## PDF Parsing

Используем `pdf-parse` (Node.js) или `pdfjs-dist`.

```ts
// lib/pdf-parser.ts
import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
```

Chunking: делить по страницам или по заголовкам (regex на H1/H2 паттерны). Размер чанка ~500-1000 токенов.

---

## RAG vs Full Context

**MVP стратегия:**
- Если документ < 50k токенов — передавать весь текст в контекст (проще, надёжнее)
- Если > 50k токенов — переходить на RAG с embeddings

Для переключения использовать флаг в `lib/claude.ts`:
```ts
const USE_RAG = extractedText.length > 50_000;
```

---

## Компоненты UI

### Workspace layout
```
[MaterialsSidebar] | [DocumentViewer] | [TutorPanel]
  200px fixed          flex-1               380px fixed
```

Брейкпоинт mobile: скрывать sidebar, DocumentViewer → accordion, TutorPanel → full screen.

### TutorPanel
- Сверху: кнопки режимов (Explain / Quiz / Flashcards / Practice)
- Средина: чат (messages list)
- Снизу: input + send

### DocumentViewer
- Рендерить extracted text (не PDF iframe — для лёгкости)
- Поддерживать выделение текста → кнопка "Explain this" появляется над выделением

---

## Команды разработки

```bash
# Установка зависимостей
npm install

# Dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Переменные окружения

```env
# .env.local
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Что проверять перед сдачей фичи

1. Загрузить тестовый PDF (любая лекция) — текст извлекается корректно
2. Tutor отвечает только по материалу документа (не галлюцинирует)
3. Flashcards / Quiz возвращают валидный JSON, рендерятся в UI
4. Study Notes сохраняются в localStorage между обновлениями страницы
5. Loading states и error states показываются корректно
6. Мобильный вид не сломан

---

## Стиль кода

- TypeScript strict mode
- Tailwind для стилей (без CSS modules)
- Server Components где возможно, Client Components только где нужен state/events
- Route Handlers в `app/api/` для AI-запросов (не выставлять API ключи на клиент)
- Обработка ошибок на уровне API routes, пробрасывать понятные сообщения на UI
