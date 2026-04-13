"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, BookOpen, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["application/pdf", "text/plain", "text/markdown"];
const ACCEPTED_EXT = [".pdf", ".txt", ".md"];

export default function LandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Demo shortcut ──────────────────────────────────────────────────────────
  const openDemo = () => {
    sessionStorage.setItem("__demo__", "1");
    router.push("/workspace");
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.toLowerCase();
      const validExt = ACCEPTED_EXT.some((e) => ext.endsWith(e));
      const validType = ACCEPTED_TYPES.includes(file.type) || validExt;

      if (!validType) {
        setError(`Unsupported file type. Please upload a PDF, TXT, or MD file.`);
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File is too large. Maximum size is 20 MB.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed. Please try again.");
        }

        const { document } = await res.json();
        sessionStorage.setItem("__doc__", JSON.stringify(document));
        router.push("/workspace");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  const handleTextSubmit = async () => {
    const text = pastedText.trim();
    if (!text || text.length < 50) {
      setError("Please paste at least 50 characters of notes.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name: "My Notes" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed.");
      }

      const { document } = await res.json();
      sessionStorage.setItem("__doc__", JSON.stringify(document));
      router.push("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[var(--text-1)] tracking-tight">Объяснятор</span>
        </div>
        <button
          onClick={openDemo}
          className="text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
        >
          Try demo →
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-10">
          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text-1)] leading-tight">
              Your notes,{" "}
              <span className="text-brand-600">explained by AI</span>
            </h1>
            <p className="text-lg text-[var(--text-2)] leading-relaxed max-w-lg mx-auto">
              Upload any study material and get step-by-step explanations, quizzes,
              and flashcards — all grounded in your own content.
            </p>
          </div>

          {/* Upload area */}
          {!showPaste ? (
            <div className="space-y-3">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-150",
                  isDragging
                    ? "border-brand-500 bg-brand-50"
                    : "border-[var(--border-strong)] bg-white hover:border-brand-400 hover:bg-brand-50/40"
                )}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-[var(--text-2)]">Processing your document…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                        isDragging ? "bg-brand-100" : "bg-[var(--bg-base)]"
                      )}
                    >
                      <Upload
                        size={24}
                        className={isDragging ? "text-brand-600" : "text-[var(--text-3)]"}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-1)]">
                        {isDragging ? "Drop to upload" : "Drop your file here"}
                      </p>
                      <p className="text-sm text-[var(--text-2)] mt-0.5">
                        or <span className="text-brand-600 font-medium">browse files</span>
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-3)]">PDF · TXT · MD — up to 20 MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-3)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <button
                onClick={() => setShowPaste(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-strong)] bg-white text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-gray-50 transition-colors"
              >
                <FileText size={15} />
                Paste notes as text
              </button>
            </div>
          ) : (
            /* Paste text area */
            <div className="space-y-3">
              <textarea
                className="w-full h-52 rounded-xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                placeholder="Paste your lecture notes, study material, or any text here…"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => { setShowPaste(false); setPastedText(""); setError(null); }}
                >
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={uploading}
                  disabled={pastedText.trim().length < 50}
                  onClick={handleTextSubmit}
                  className="flex-1"
                >
                  Start learning
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-[var(--border)] py-12 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            {
              icon: <BookOpen size={18} />,
              title: "Understand deeply",
              desc: "Step-by-step explanations grounded in your material",
            },
            {
              icon: <Zap size={18} />,
              title: "Test yourself",
              desc: "Auto-generated quizzes and flashcards from your notes",
            },
            {
              icon: <FileText size={18} />,
              title: "Save insights",
              desc: "Collect AI explanations into export-ready study notes",
            },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto">
                {f.icon}
              </div>
              <p className="font-medium text-sm text-[var(--text-1)]">{f.title}</p>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
