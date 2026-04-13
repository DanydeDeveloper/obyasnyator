"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Eye, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PracticeProblem, DocumentChunk } from "@/types";

interface PracticeModalProps {
  open: boolean;
  onClose: () => void;
  docName: string;
  chunks: DocumentChunk[];
}

export function PracticeModal({ open, onClose, docName, chunks }: PracticeModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [shownHints, setShownHints] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(""); setProblems([]); setRevealed({}); setShownHints({});
    fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chunks, count: 3 }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.error) throw new Error(data.error); setProblems(data.problems); })
      .catch((err) => setError(err.message ?? "Не удалось создать задачи."))
      .finally(() => setLoading(false));
  }, [open, chunks]);

  const revealSolution = (id: string) => setRevealed((prev) => ({ ...prev, [id]: true }));
  const showNextHint = (id: string, total: number) => setShownHints((prev) => ({ ...prev, [id]: Math.min((prev[id] ?? 0) + 1, total) }));

  return (
    <Modal open={open} onClose={onClose} title="Практика" subtitle={docName.replace(/\.[^.]+$/, "")} size="lg">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-2)]">Генерирую задачи…</p>
        </div>
      )}

      {error && (
        <div className="p-6 text-center space-y-3">
          <XCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[var(--text-2)]">{error}</p>
          <Button variant="secondary" size="md" onClick={onClose}>Закрыть</Button>
        </div>
      )}

      {!loading && !error && problems.length > 0 && (
        <div className="divide-y divide-[var(--border)]">
          {problems.map((problem, idx) => {
            const hintCount = shownHints[problem.id] ?? 0;
            const isRevealed = revealed[problem.id] ?? false;
            const hintsAvailable = problem.hints.length;

            return (
              <div key={problem.id} className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <p className="text-[15px] text-[var(--text-1)] leading-relaxed flex-1">{problem.question}</p>
                </div>

                {hintCount > 0 && (
                  <div className="pl-10 space-y-2 animate-fade-in">
                    {problem.hints.slice(0, hintCount).map((hint, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 animate-slide-up">
                        <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{hint}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isRevealed && (
                  <div className="pl-10 animate-slide-up">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 space-y-1.5">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Решение</p>
                      <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">{problem.solution}</p>
                    </div>
                  </div>
                )}

                <div className="pl-10 flex items-center gap-2 flex-wrap">
                  {!isRevealed && hintCount < hintsAvailable && (
                    <button onClick={() => showNextHint(problem.id, hintsAvailable)}
                      className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 border border-amber-200 transition-colors">
                      <Lightbulb size={12} />
                      {hintCount === 0 ? "Подсказка" : "Следующая подсказка"}
                      <Badge variant="amber" className="ml-1">ещё {hintsAvailable - hintCount}</Badge>
                    </button>
                  )}
                  {!isRevealed && (
                    <button onClick={() => revealSolution(problem.id)}
                      className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 border border-emerald-200 transition-colors">
                      <Eye size={12} />
                      Показать решение
                    </button>
                  )}
                  {isRevealed && <span className="text-xs text-[var(--text-3)] flex items-center gap-1"><span className="text-emerald-500">✓</span> Решение показано</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
