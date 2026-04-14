# Skills — Объяснятор

Навыки и рабочие инструкции для работы с проектом.

---

## Контекст проекта

Документация в `/docs/`:
- [product-overview.md](docs/product-overview.md) — что такое продукт
- [features.md](docs/features.md) — фичи, что делать / не делать
- [architecture.md](docs/architecture.md) — стек, структура, data flow
- [user-scenarios.md](docs/user-scenarios.md) — аудитория, сценарии
- [mvp-scope.md](docs/mvp-scope.md) — скоуп V1, приоритеты

---

## AI — правила работы с тьютором

**System prompt должен включать:**
- Роль: отвечать ТОЛЬКО по материалу пользователя
- Контекст: релевантные чанки документа
- Язык: отвечать на языке пользователя
- Стиль: пошагово, с **жирным** для терминов

**Модели:**
| Задача | Модель |
|--------|--------|
| Чат тьютора | `claude-sonnet-4-6` |
| Квиз, карточки, практика | `claude-haiku-4-5-20251001` |

**Retrieval (lib/ai.ts → tutor route):**
- Keyword scoring по чанкам без embeddings
- Top-4 релевантных чанка в контекст
- Восстанавливаем оригинальный порядок чанков

---

## PDF парсинг

```ts
import pdfParse from "pdf-parse";
const result = await pdfParse(buffer);
const text = result.text;
```

Chunking (`app/api/upload/route.ts`):
- Разбивка по двойным переносам + заголовкам
- Fallback: чанки по ~800 символов с 50-символьным перекрытием
- Label = первая строка чанка (до 80 символов)

---

## Structured output (квиз, карточки, практика)

Haiku возвращает JSON без markdown-обёртки если попросить явно:
```
Return ONLY a JSON array, no markdown, no explanation.
```

Всегда парсим через `parseJSON()` из `lib/ai.ts` — он стрипает ```json блоки если вдруг появятся.

---

## Сессия и состояние

- Документ хранится в `sessionStorage` как `__doc__`
- Демо-режим: `sessionStorage.__demo__ = "1"`
- Чат и заметки: `sessionStorage` через `lib/session.ts`
- При каждом изменении — автосохранение в `useEffect`

---

## UI компоненты

**Workspace layout:**
```
[MaterialsSidebar 240px] | [DocumentViewer flex-1] | [TutorPanel 360px]
```

**Добавить модал:**
1. Создай компонент с `<Modal>` из `components/ui/Modal.tsx`
2. Добавь `open/onClose/docName/chunks` в props
3. Добавь state в `workspace/page.tsx`: `openModal`
4. Рендери под `<PracticeModal />`

**Toast уведомления:**
```ts
const { toast, show: showToast, dismiss } = useToast();
showToast("Сообщение");
```

---

## Что проверять перед деплоем

1. `npm run type-check` — 0 ошибок
2. Демо-режим работает (`/workspace?demo`)
3. Загрузка PDF — текст извлекается
4. Квиз/карточки/практика — модалы открываются
5. Сохранение заметок + экспорт
6. Нет консольных ошибок
