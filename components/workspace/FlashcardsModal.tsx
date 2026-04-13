"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { Flashcard, DocumentChunk } from "@/types";

interface FlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  docName: string;
  chunks: DocumentChunk[];
}

export function FlashcardsModal({ open, onClose, docName, chunks }: FlashcardsModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(""); setCards([]); setCurrent(0); setFlipped(false);
    fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chunks, count: 10 }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.error) throw new Error(data.error); setCards(data.flashcards); })
      .catch((err) => setError(err.message ?? "Не удалось создать карточки."))
      .finally(() => setLoading(false));
  }, [open, chunks]);

  const goTo = (idx: number) => { setCurrent(idx); setFlipped(false); };
  const prev = () => goTo(Math.max(0, current - 1));
  const next = () => goTo(Math.min(cards.length - 1, current + 1));
  const shuffle = () => { setCards((prev) => [...prev].sort(() => Math.random() - 0.5)); setCurrent(0); setFlipped(false); };

  const card = cards[current];

  return (
    <Modal open={open} onClose={onClose} title="Карточки" subtitle={docName.replace(/\.[^.]+$/, "")} size="md">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-2)]">Генерирую карточки…</p>
        </div>
      )}

      {error && (
        <div className="p-6 text-center space-y-3">
          <XCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[var(--text-2)]">{error}</p>
          <Button variant="secondary" size="md" onClick={onClose}>Закрыть</Button>
        </div>
      )}

      {!loading && !error && card && (
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-3)]">{current + 1} / {cards.length}</span>
            <button onClick={shuffle} className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors px-2 py-1 rounded-md hover:bg-black/5">
              <Shuffle size={12} />
              Перемешать
            </button>
          </div>

          <div className="relative cursor-pointer select-none" style={{ perspective: "1000px", height: "220px" }} onClick={() => setFlipped((f) => !f)}>
            <div className="absolute inset-0 transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <div className="absolute inset-0 rounded-2xl bg-white border border-[var(--border-strong)] shadow-card flex flex-col items-center justify-center p-8 gap-3" style={{ backfaceVisibility: "hidden" }}>
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-3)] font-semibold">Вопрос</span>
                <p className="text-[15px] font-medium text-[var(--text-1)] text-center leading-snug">{card.front}</p>
                <span className="text-xs text-[var(--text-3)] mt-2">Нажми чтобы увидеть ответ</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-50 border border-brand-200 shadow-card flex flex-col items-center justify-center p-8 gap-3" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <span className="text-[10px] uppercase tracking-widest text-brand-400 font-semibold">Ответ</span>
                <p className="text-[15px] text-[var(--text-1)] text-center leading-relaxed">{card.back}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" onClick={prev} disabled={current === 0}><ChevronLeft size={15} />Назад</Button>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
              {cards.map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)} className={cn("w-2 h-2 rounded-full transition-all duration-150", idx === current ? "bg-brand-600 scale-125" : "bg-[var(--border-strong)] hover:bg-[var(--text-3)]")} />
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={next} disabled={current === cards.length - 1}>Вперёд<ChevronRight size={15} /></Button>
          </div>

          {current === cards.length - 1 && (
            <div className="text-center animate-fade-in">
              <button onClick={() => goTo(0)} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 mx-auto transition-colors">
                <RotateCcw size={12} />
                Начать сначала
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
