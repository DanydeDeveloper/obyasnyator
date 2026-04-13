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
      system: "You are an expert educator. Create flashcards based ONLY on the provided material. Return only valid JSON, no markdown.",
      messages: [{
        role: "user",
        content: `Generate exactly ${count} flashcards from this material.

Return ONLY a JSON array:
[
  {
    "front": "Question or term (max 15 words)",
    "back": "Answer or definition (1-3 sentences)"
  }
]

Rules: cover the most important concepts, mix definition/concept/application cards.

MATERIAL:
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
