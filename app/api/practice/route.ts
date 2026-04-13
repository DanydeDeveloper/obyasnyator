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
      system: "You are an expert educator. Create practice problems based ONLY on the provided material. Return only valid JSON, no markdown.",
      messages: [{
        role: "user",
        content: `Generate exactly ${count} practice problems from this material.

Return ONLY a JSON array:
[
  {
    "question": "Full problem statement",
    "hints": ["Gentle first hint", "More specific second hint"],
    "solution": "Complete solution with explanation"
  }
]

Rules: require applying knowledge (not just recall), exactly 2 hints each, problems answerable from material only.

MATERIAL:
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
