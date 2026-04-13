"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { QuizQuestion, DocumentChunk } from "@/types";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  docName: string;
  chunks: DocumentChunk[];
}

type Phase = "loading" | "error" | "question" | "result";

export function QuizModal({ open, onClose, docName, chunks }: QuizModalProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPhase("loading");
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setError("");

    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chunks, count: 5 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions);
        setPhase("question");
      })
      .catch((err) => { setError(err.message ?? "Не удалось создать квиз."); setPhase("error"); });
  }, [open, chunks]);

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + (submitted ? 1 : 0)) / questions.length) * 100 : 0;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) { setPhase("result"); }
    else { setCurrent((c) => c + 1); setSelected(null); setSubmitted(false); }
  };

  const handleRestart = () => { setCurrent(0); setSelected(null); setSubmitted(false); setScore(0); setPhase("question"); };

  const scoreLabel = () => {
    const pct = score / questions.length;
    if (pct === 1) return "Идеальный результат!";
    if (pct >= 0.8) return "Отличная работа!";
    if (pct >= 0.6) return "Хороший результат!";
    return "Продолжай учиться!";
  };

  return (
    <Modal open={open} onClose={onClose} title="Квиз" subtitle={docName.replace(/\.[^.]+$/, "")} size="md">
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-2)]">Генерирую вопросы…</p>
        </div>
      )}

      {phase === "error" && (
        <div className="p-6 text-center space-y-3">
          <XCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[var(--text-2)]">{error}</p>
          <Button variant="secondary" size="md" onClick={onClose}>Закрыть</Button>
        </div>
      )}

      {phase === "question" && q && (
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
              <span>Вопрос {current + 1} из {questions.length}</span>
              <span>{score} верно</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <p className="text-[15px] font-medium text-[var(--text-1)] leading-snug">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              const showResult = submitted;
              let stateClass = "border-[var(--border-strong)] bg-white hover:border-brand-400 hover:bg-brand-50/40";
              if (showResult && isCorrect) stateClass = "border-emerald-500 bg-emerald-50";
              else if (showResult && isSelected && !isCorrect) stateClass = "border-red-400 bg-red-50";
              else if (!showResult && isSelected) stateClass = "border-brand-500 bg-brand-50";

              return (
                <button key={idx} disabled={submitted} onClick={() => setSelected(idx)}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150", stateClass, submitted ? "cursor-default" : "cursor-pointer")}
                >
                  <span className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                    showResult && isCorrect ? "border-emerald-500 bg-emerald-500 text-white"
                      : showResult && isSelected && !isCorrect ? "border-red-400 bg-red-400 text-white"
                      : isSelected ? "border-brand-500 bg-brand-500 text-white"
                      : "border-[var(--border-strong)] text-[var(--text-3)]"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={cn("flex-1",
                    showResult && isCorrect ? "text-emerald-800 font-medium"
                      : showResult && isSelected && !isCorrect ? "text-red-700"
                      : "text-[var(--text-1)]"
                  )}>
                    {option}
                  </span>
                  {showResult && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div className={cn("rounded-xl px-4 py-3 text-sm leading-relaxed animate-fade-in",
              selected === q.correctIndex ? "bg-emerald-50 border border-emerald-100 text-emerald-800" : "bg-amber-50 border border-amber-100 text-amber-800"
            )}>
              <span className="font-medium">{selected === q.correctIndex ? "✓ Верно! " : "✗ Не совсем. "}</span>
              {q.explanation}
            </div>
          )}

          <div className="flex justify-end pt-1">
            {!submitted ? (
              <Button variant="primary" size="md" disabled={selected === null} onClick={handleSubmit}>Ответить</Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleNext}>
                {current + 1 >= questions.length ? "Результаты" : "Следующий вопрос"}
                <ChevronRight size={15} />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="p-8 text-center space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
              <Trophy size={28} className="text-brand-600" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-1)]">{scoreLabel()}</h3>
            <p className="text-[var(--text-2)] text-sm">
              Правильных ответов: <span className="font-semibold text-brand-600">{score}</span> из <span className="font-semibold">{questions.length}</span>
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-1.5">
            <div className="h-3 bg-[var(--bg-base)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${(score / questions.length) * 100}%`,
                background: score / questions.length >= 0.8 ? "rgb(16 185 129)" : score / questions.length >= 0.6 ? "rgb(245 158 11)" : "rgb(239 68 68)",
              }} />
            </div>
            <p className="text-xs text-[var(--text-3)]">{Math.round((score / questions.length) * 100)}%</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" size="md" onClick={handleRestart}><RotateCcw size={14} />Попробовать снова</Button>
            <Button variant="primary" size="md" onClick={onClose}>Готово</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
