import Anthropic from "@anthropic-ai/sdk";
import type { DocumentChunk } from "@/types";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Model for main tutor chat */
export const TUTOR_MODEL = "claude-sonnet-4-6";

/** Model for structured generation (quiz, flashcards, practice) — fast */
export const GEN_MODEL = "claude-haiku-4-5-20251001";

export function buildContext(chunks: DocumentChunk[]): string {
  return chunks.map((c) => `[${c.label}]\n${c.text}`).join("\n\n---\n\n");
}

/** Strip markdown code fences and parse JSON safely */
export function parseJSON<T>(raw: string): T {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(stripped) as T;
}

export function noKeyResponse() {
  return Response.json(
    { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local." },
    { status: 503 }
  );
}
