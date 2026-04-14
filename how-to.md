# How-To — Объяснятор

Практическое руководство по разработке и работе с проектом.

---

## Запуск локально

```bash
cd obyasnyator
npm install
cp .env.local.example .env.local   # вставь ANTHROPIC_API_KEY
npm run dev                         # http://localhost:3000
```

## Деплой на Vercel

Любой `git push` в ветку `main` → Vercel автоматически деплоит.

Вручную: vercel.com → проект → Deployments → Redeploy.

Переменные окружения: Vercel Dashboard → Settings → Environment Variables.

## Добавить новый API роут

1. Создай файл `app/api/название/route.ts`
2. Используй клиент из `lib/ai.ts` (anthropic + buildContext + parseJSON)
3. Добавь кнопку в `TutorPanel.tsx` или новый модал в `components/workspace/`
4. Подключи модал в `app/workspace/page.tsx`

## Добавить новый режим тьютора

1. Добавь `QuickBtn` в `TutorPanel.tsx`
2. Если это чат → передай промпт в `sendMessage()`
3. Если это модал → добавь callback `onOpen*` в props и открывай через `setOpenModal()`

## Изменить модели Claude

В `lib/ai.ts`:
```ts
export const TUTOR_MODEL = "claude-sonnet-4-6";      // основной чат
export const GEN_MODEL = "claude-haiku-4-5-20251001"; // квиз, карточки, практика
```

## Обновить API ключ

Локально: отредактируй `.env.local`
На проде: Vercel → Settings → Environment Variables → ANTHROPIC_API_KEY → Edit

## Экспорт заметок

Кнопка "Экспорт заметок" в шапке воркспейса — скачивает `.md` файл.
Активна только если есть сохранённые заметки.

## Тестирование на реальных данных

1. Открой `http://localhost:3000`
2. Нажми "Демо" — видишь мок-данные на русском
3. Загрузи реальный PDF — проверь парсинг
4. Попробуй квиз / карточки / практику

## Структура проекта

```
app/
  page.tsx              — лендинг
  workspace/page.tsx    — воркспейс
  api/
    upload/route.ts     — парсинг PDF/TXT
    tutor/route.ts      — чат тьютора
    quiz/route.ts       — генерация квиза
    flashcards/route.ts — генерация карточек
    practice/route.ts   — генерация задач

components/workspace/   — все компоненты воркспейса
components/ui/          — базовые UI компоненты
lib/
  ai.ts                 — клиент Anthropic + хелперы
  session.ts            — сохранение сессии
  mock-data.ts          — демо-данные
types/index.ts          — все TypeScript типы
```
