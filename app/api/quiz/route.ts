import { NextRequest, NextResponse } from "next/server";
import { anthropic, GEN_MODEL, buildContext, parseJSON, noKeyResponse } from "@/lib/ai";
import type { QuizRequest, QuizQuestion } from "@/types";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return noKeyResponse();

  try {
    const { chunks, count = 5 }: QuizRequest = await req.json();
    if (!chunks?.length) return NextResponse.json({ error: "No document chunks provided." }, { status: 400 });

    const response = await anthropic.messages.create({
      model: GEN_MODEL,
      max_tokens: 2048,
      system: "You are an expert educator. Generate quiz questions based ONLY on the provided material. Return only valid JSON, no markdown.",
      messages: [{
        role: "user",
        content: `Generate exactly ${count} multiple-choice questions from this material.

Return ONLY a JSON array:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Brief explanation referencing the material."
  }
]

Rules: test real understanding, all 4 options plausible, correctIndex is 0-based.

MATERIAL:
${buildContext(chunks)}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
    const questions = parseJSON<Omit<QuizQuestion, "id">[]>(raw);
    const result: QuizQuestion[] = questions.map((q) => ({ ...q, id: generateId() }));
    return NextResponse.json({ questions: result });
  } catch (err) {
    console.error("[quiz] error:", err);
    return NextResponse.json({ error: "Failed to generate quiz. Please try again." }, { status: 500 });
  }
}
