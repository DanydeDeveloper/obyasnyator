import { NextRequest, NextResponse } from "next/server";
import { anthropic, GEN_MODEL, buildContext, parseJSON, noKeyResponse } from "@/lib/ai";
import type { PracticeRequest, PracticeProblem } from "@/types";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return noKeyResponse();

  try {
    const { chunks, count = 3 }: PracticeRequest = await req.json();
    if (!chunks?.length) return NextResponse.json({ error: "No document chunks provided." }, { status: 400 });

    const response = await anthropic.messages.create({
      model: GEN_MODEL,
      max_tokens: 2048,
      system: "Ты опытный педагог. Создавай практические задачи ТОЛЬКО на основе предоставленного материала. ВАЖНО: все задачи, подсказки и решения должны быть ИСКЛЮЧИТЕЛЬНО на русском языке, даже если материал на английском. Возвращай только валидный JSON, без markdown.",
      messages: [{
        role: "user",
        content: `Сгенерируй ровно ${count} практических задачи по этому материалу. ОБЯЗАТЕЛЬНО пиши всё только на русском языке, независимо от языка исходного материала.

Верни ТОЛЬКО JSON-массив:
[
  {
    "question": "Полная формулировка задачи",
    "hints": ["Мягкая первая подсказка", "Более конкретная вторая подсказка"],
    "solution": "Полное решение с объяснением"
  }
]

Правила: задачи должны требовать применения знаний (не просто припоминания), ровно 2 подсказки к каждой, задачи должны решаться только на основе материала.

МАТЕРИАЛ:
${buildContext(chunks)}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
    const problems = parseJSON<Omit<PracticeProblem, "id">[]>(raw);
    const result: PracticeProblem[] = problems.map((p) => ({ ...p, id: generateId() }));
    return NextResponse.json({ problems: result });
  } catch (err) {
    console.error("[practice] error:", err);
    return NextResponse.json({ error: "Failed to generate practice problems. Please try again." }, { status: 500 });
  }
}
