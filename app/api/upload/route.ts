import { NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import type { ProcessedDocument, DocumentChunk } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// ── Text chunking ─────────────────────────────────────────────────────────────

function chunkText(text: string): DocumentChunk[] {
  // Split by double newlines, markdown headings, or page markers
  const rawSections = text
    .split(/\n{2,}(?=[A-Z#])|(?=^#{1,3} )/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 60);

  if (rawSections.length <= 1) {
    // Fallback: split into fixed-size chunks of ~800 chars
    const chunks: DocumentChunk[] = [];
    let i = 0;
    while (i < text.length) {
      const slice = text.slice(i, i + 800).trim();
      if (slice) {
        chunks.push({
          id: generateId(),
          index: chunks.length,
          label: `Section ${chunks.length + 1}`,
          text: slice,
        });
      }
      i += 750; // 50-char overlap
    }
    return chunks;
  }

  return rawSections.map((section, idx) => {
    // Use first line as label (strip markdown heading symbols)
    const firstLine = section.split("\n")[0].replace(/^#+\s*/, "").slice(0, 80);
    return {
      id: generateId(),
      index: idx,
      label: firstLine || `Section ${idx + 1}`,
      text: section,
    };
  });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let text = "";
    let name = "Untitled";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }

      name = file.name;
      const ext = file.name.toLowerCase();

      if (ext.endsWith(".pdf") || file.type === "application/pdf") {
        // Dynamically import pdf-parse (Node.js only)
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await pdfParse(buffer);
        text = result.text;
      } else if (ext.endsWith(".txt") || ext.endsWith(".md") || file.type.startsWith("text/")) {
        text = await file.text();
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF, TXT, or MD file." },
          { status: 400 }
        );
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body.text ?? "";
      name = body.name ?? "My Notes";
    } else {
      return NextResponse.json({ error: "Unsupported content type." }, { status: 400 });
    }

    text = text.trim();
    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "The document appears to be empty or too short to process." },
        { status: 422 }
      );
    }

    const chunks = chunkText(text);

    const document: ProcessedDocument = {
      id: generateId(),
      name,
      fullText: text.slice(0, 100_000), // cap stored text
      chunks,
      pageCount: chunks.length,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({ document });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json(
      { error: "Failed to process the document. Please try a different file." },
      { status: 500 }
    );
  }
}
