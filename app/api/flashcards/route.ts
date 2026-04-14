import { NextRequest, NextResponse } from "next/server";
import { anthropic, GEN_MODEL, buildContext, parseJSON, noKeyResponse } from "@/lib/ai";
import type { FlashcardsRequest, Flashcard } from "@/types";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return noKeyResponse();

  try {
    const { chunks, count = 10 }: FlashcardsRequest = await req.json();
    if (!chunks?.length) return NextResponse.json({ error: "No document chunks provided." }, { status: 400 });

    const response = await anthropic.messages.create({
      model: GEN_MODEL,
      max_tokens: 2048,
      system: "Ты опытный педагог. Создавай карточки ТОЛЬКО на основе предоставленного материала. ВАЖНО: все карточки должны быть ИСКЛЮЧИТЕЛЬНО на русском языке, даже если материал на английском. Возвращай только валидный JSON, без markdown.",
      messages: [{
        role: "user",
        content: `Сгенерируй ровно ${count} карточек по этому материалу. ОБЯЗАТЕЛЬНО пиши все вопросы и ответы только на русском языке, независимо от языка исходного материала.

Верни ТОЛЬКО JSON-массив:
[
  {
    "front": "Вопрос или термин (максимум 15 слов)",
    "back": "Ответ или определение (1-3 предложения)"
  }
]

Правила: охвати самые важные концепции, чередуй карточки на определения, понятия и применение.

МАТЕРИАЛ:
${buildContext(chunks)}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
    const cards = parseJSON<Omit<Flashcard, "id">[]>(raw);
    const result: Flashcard[] = cards.map((c) => ({ ...c, id: generateId() }));
    return NextResponse.json({ flashcards: result });
  } catch (err) {
    console.error("[flashcards] error:", err);
    return NextResponse.json({ error: "Failed to generate flashcards. Please try again." }, { status: 500 });
  }
}
