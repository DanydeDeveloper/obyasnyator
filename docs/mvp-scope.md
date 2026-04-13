# Объяснятор — MVP Scope

## Что делаем в V1

| Фича | Статус |
|------|--------|
| Upload PDF | ✅ V1 |
| Upload slides (PPT/PPTX) | ✅ V1 |
| Paste plain text / markdown | ✅ V1 |
| Document viewer (extracted text) | ✅ V1 |
| AI Tutor panel (chat) | ✅ V1 |
| Explain selected text | ✅ V1 |
| Generate flashcards | ✅ V1 |
| Generate quiz | ✅ V1 |
| Generate practice problems | ✅ V1 |
| Saved study notes (session) | ✅ V1 |
| Concept map / visual outline | ✅ V1 (упрощённо) |

## Что НЕ делаем в V1

| Фича | Когда |
|------|-------|
| Collaboration / invite friends | V2+ |
| Public publishing / sharing | V2+ |
| Classroom / teacher features | Вне скоупа |
| Recorder / live audio | V2 |
| YouTube ingestion | V2 |
| Video tutorial generation | Вне скоупа |
| Background tasks | Вне скоупа |
| Web-wide knowledge (не только документ пользователя) | Вне скоупа |
| Auth / accounts | V2 (в V1 — localStorage) |
| Mobile app | Вне скоупа |

---

## Минимальная рабочая версия

Самая маленькая версия, которая уже показывает ценность продукта:

1. Upload PDF или вставить текст
2. Document viewer показывает extracted text
3. AI Tutor отвечает на вопросы по документу
4. Кнопка "Explain this" для выделенного текста
5. Кнопка "Quiz me" — 5 вопросов по материалу
6. Кнопка "Make flashcards" — 10 карточек
7. Сохранить ответы AI в Study Notes

Это уже воспроизводит главный user journey и демонстрирует идею продукта.

---

## Приоритеты разработки

### Sprint 1: Core infrastructure
- Next.js проект, layout (sidebar + document + tutor panel)
- Upload + PDF parsing
- AI Tutor chat (Claude API)

### Sprint 2: Tutor modes
- Explain this (selected text)
- Quiz me
- Make flashcards

### Sprint 3: Practice & Notes
- Practice problems
- Study Notes (save AI outputs)
- Session summary

### Sprint 4: Polish
- Visual explainer (concept map)
- Export to markdown
- UI polish, loading states, error handling
