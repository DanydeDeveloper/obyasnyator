"use client";

import { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { ProcessedDocument, DocumentChunk } from "@/types";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  document: ProcessedDocument;
  activeSectionIndex: number;
  onSectionVisible: (index: number) => void;
  onExplainSelection: (text: string) => void;
}

export function DocumentViewer({ document, activeSectionIndex, onSectionVisible, onExplainSelection }: DocumentViewerProps) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRefs.current[activeSectionIndex];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSectionIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = Number((visible[0].target as HTMLElement).dataset.index);
          if (!isNaN(idx)) onSectionVisible(idx);
        }
      },
      { root: container, threshold: 0.3 }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [document.chunks, onSectionVisible]);

  const selectionPopupRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    const popup = selectionPopupRef.current;
    if (!popup) return;

    if (!text || text.length < 15) { popup.style.display = "none"; return; }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const top = rect.top - containerRect.top + containerRef.current!.scrollTop - 48;
    const left = rect.left - containerRect.left + rect.width / 2 - 60;
    popup.style.display = "flex";
    popup.style.top = `${Math.max(0, top)}px`;
    popup.style.left = `${Math.max(0, left)}px`;

    const btn = popup.querySelector("button");
    if (btn) {
      btn.onclick = () => {
        onExplainSelection(text);
        popup.style.display = "none";
        selection?.removeAllRanges();
      };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto h-full"
      onMouseUp={handleMouseUp}
      onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-popup]")) { if (selectionPopupRef.current) selectionPopupRef.current.style.display = "none"; } }}
    >
      {/* Selection popup */}
      <div
        ref={selectionPopupRef}
        data-popup
        style={{ display: "none", position: "absolute", zIndex: 50 }}
        className="items-center gap-1.5 bg-[#1a1a1a] text-white text-xs rounded-lg px-3 py-2 shadow-modal animate-fade-in"
      >
        <Sparkles size={12} className="text-brand-300" />
        <button className="font-medium hover:text-brand-200 transition-colors whitespace-nowrap">
          Объяснить
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight leading-tight">
            {document.name.replace(/\.[^.]+$/, "")}
          </h1>
          {document.pageCount && (
            <p className="text-sm text-[var(--text-3)] mt-1.5">
              {document.pageCount} стр. · {document.chunks.length} разделов
            </p>
          )}
        </div>

        <div className="space-y-10">
          {document.chunks.map((chunk) => (
            <Section
              key={chunk.id}
              chunk={chunk}
              isActive={activeSectionIndex === chunk.index}
              ref={(el) => { sectionRefs.current[chunk.index] = el; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  chunk: DocumentChunk;
  isActive: boolean;
}

const Section = ({ chunk, isActive, ref }: SectionProps & { ref: (el: HTMLElement | null) => void }) => {
  const paragraphs = chunk.text.split("\n\n").map((p) => p.trim()).filter(Boolean);
  return (
    <section ref={ref} data-index={chunk.index} className={cn("scroll-mt-8 transition-opacity duration-200", isActive ? "opacity-100" : "opacity-80")}>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
          {chunk.index + 1}
        </span>
        <h2 className="text-base font-semibold text-[var(--text-1)]">{chunk.label}</h2>
      </div>
      <div className="doc-content pl-9 space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] leading-[1.8] text-[var(--text-1)]">{p}</p>
        ))}
      </div>
      <div className="mt-6 pl-9 border-t border-[var(--border)]" />
    </section>
  );
};
