import Anthropic from "@anthropic-ai/sdk";
import type { DocumentChunk } from "@/types";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
