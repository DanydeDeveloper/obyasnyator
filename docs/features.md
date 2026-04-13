# Объяснятор — Features

## Главная идея интерфейса

Одна учебная рабочая страница с тремя зонами:
- **слева** — список загруженных материалов
- **в центре** — сам документ / extracted notes
- **справа** — AI tutor panel

Идея: "AI lives in your notes", а не "ты уходишь в отдельный чат-бот".

---

## 4.2. Загрузка материалов

**V1 (MVP):**
- загрузить PDF
- загрузить слайды (PPT/PPTX)
- вставить текст конспекта (plain text / markdown)

**V2 (не делать сейчас):**
- вставить YouTube link
- загрузить аудио

---

## 4.3. AI Tutor

Центральная часть продукта. Tutor умеет:

- объяснить выделенный фрагмент простыми словами
- дать пошаговый разбор
- ответить на вопрос по загруженному материалу
- указать, на какие части документа он опирается (source references)
- задавать проверочные вопросы
- подстраивать глубину ответа: кратко / подробно / как для новичка

### Режимы tutor (кнопки быстрого доступа):
- **Explain this** — объяснить выделенный текст или текущий раздел
- **Quiz me** — задать проверочные вопросы
- **Make flashcards** — создать карточки
- **Give practice problems** — дать задачи для практики
- **Ask me a question** — Socratic mode, один вопрос за раз

---

## 4.4. Practice Tools

Отдельные кнопки генерации:
- **Generate flashcards** — карточки вопрос/ответ
- **Generate quiz** — тест с вариантами
- **Generate practice problems** — задачи для практики
- **Test me orally** — задавать вопросы по одному, ждать ответа, давать feedback

---

## 4.5. Visual Explainers (упрощённая версия)

Реальный Opennote генерирует видео и диаграммы. В Lite — лёгкая версия:
- concept map (карта понятий)
- structured outline (структурированный план)
- "explain visually" в виде блоков и стрелок (псевдо-диаграмма)

Генерировать видео — не нужно.

---

## 4.6. Session Notes

- пользователь сохраняет хороший ответ AI в "Study Notes"
- собрать из сессии summary
- экспортировать итог в markdown или PDF

---

## Что НЕ делать в V1

| Фича | Почему нет |
|------|-----------|
| Collaboration / invite friends | Social features — V2+ |
| Public publishing | Лишняя сложность |
| Classroom / teacher features | Не целевая аудитория |
| Recorder / live audio | V2 |
| YouTube ingestion | V2 |
| Video tutorials | Тяжёлая медиа-генерация |
| Background tasks across the app | Overengineering для MVP |
| Web-wide knowledge integration | Только материал пользователя |
