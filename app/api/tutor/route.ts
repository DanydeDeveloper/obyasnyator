import { NextRequest, NextResponse } from "next/server";
import { anthropic, TUTOR_MODEL, buildContext, noKeyResponse } from "@/lib/ai";
import type { TutorRequest, DocumentChunk } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function scoreChunk(chunk: DocumentChunk, query: string): number {
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const text = chunk.text.toLowerCase();
  return words.reduce((score, word) => {
    return score + (text.match(new RegExp(word, "g")) ?? []).length;
  }, 0);
}

function retrieveChunks(chunks: DocumentChunk[], query: string, topK = 4): DocumentChunk[] {
  if (chunks.length <= topK) return chunks;
  return [...chunks]
    .map((c) => ({ chunk: c, score: scoreChunk(c, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .sort((a, b) => a.chunk.index - b.chunk.index)
    .map((s) => s.chunk);
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return noKeyResponse();

  try {
    const body: TutorRequest = await req.json();
    const { message, chunks, history = [] } = body;

    if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (!chunks?.length) return NextResponse.json({ error: "No document chunks provided." }, { status: 400 });

    const relevant = retrieveChunks(chunks, message);
    const context = buildContext(relevant);

    const systemPrompt = `You are an expert AI tutor. Help the student understand their uploaded study material.

RULES:
- Answer ONLY based on the material provided below.
- If the material doesn't contain enough information, say so clearly.
- Be encouraging, clear, and pedagogically effective.
- Use step-by-step explanations when helpful.
- Use Socratic questions to deepen understanding.
- Format with **bold** for key terms, bullet lists for multi-item answers.
- Respond in the same language the student writes in.

MATERIAL:
${context}`;

    const response = await anthropic.messages.create({
      model: TUTOR_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history.slice(-8).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: message },
      ],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content, sourceChunkIds: relevant.map((c) => c.id) });
  } catch (err) {
    console.error("[tutor] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "The AI tutor encountered an error." },
      { status: 500 }
    );
  }
}
