"use client";

import { useState } from "react";
import { FileText, ChevronRight, StickyNote, Copy, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessedDocument, DocumentChunk, StudyNote } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface MaterialsSidebarProps {
  document: ProcessedDocument;
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
  studyNotes: StudyNote[];
  onDeleteNote: (id: string) => void;
  activeTab: "document" | "notes";
  onTabChange: (tab: "document" | "notes") => void;
}

export function MaterialsSidebar({
  document,
  activeSectionIndex,
  onSectionClick,
  studyNotes,
  onDeleteNote,
  activeTab,
  onTabChange,
}: MaterialsSidebarProps) {
  return (
    <aside
      className="flex flex-col h-full border-r border-[var(--border)] overflow-hidden"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Document header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-brand-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--text-1)] leading-tight truncate">
              {document.name}
            </p>
            {document.pageCount && (
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                {document.pageCount} стр. · {document.chunks.length} разделов
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 pb-0 gap-1">
        <TabButton active={activeTab === "document"} onClick={() => onTabChange("document")}>
          Разделы
        </TabButton>
        <TabButton active={activeTab === "notes"} onClick={() => onTabChange("notes")}>
          Заметки
          {studyNotes.length > 0 && (
            <Badge variant="brand" className="ml-1.5 text-[10px] px-1.5 py-0">
              {studyNotes.length}
            </Badge>
          )}
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {activeTab === "document" ? (
          <SectionList
            chunks={document.chunks}
            activeSectionIndex={activeSectionIndex}
            onSectionClick={onSectionClick}
          />
        ) : (
          <NotesList studyNotes={studyNotes} onDelete={onDeleteNote} />
        )}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center flex-1 justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
        active
          ? "bg-white text-[var(--text-1)] shadow-card"
          : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-black/5"
      )}
    >
      {children}
    </button>
  );
}

function SectionList({
  chunks,
  activeSectionIndex,
  onSectionClick,
}: {
  chunks: DocumentChunk[];
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
}) {
  return (
    <ul className="px-2 space-y-0.5">
      {chunks.map((chunk) => (
        <li key={chunk.id}>
          <button
            onClick={() => onSectionClick(chunk.index)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors group",
              activeSectionIndex === chunk.index
                ? "bg-white shadow-card text-[var(--text-1)]"
                : "text-[var(--text-2)] hover:bg-black/5 hover:text-[var(--text-1)]"
            )}
          >
            <span
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold",
                activeSectionIndex === chunk.index
                  ? "bg-brand-100 text-brand-600"
                  : "bg-black/6 text-[var(--text-3)] group-hover:bg-black/8"
              )}
            >
              {chunk.index + 1}
            </span>
            <span className="text-[13px] font-medium leading-snug flex-1 min-w-0 truncate">
              {chunk.label}
            </span>
            {activeSectionIndex === chunk.index && (
              <ChevronRight size={12} className="text-[var(--text-3)] flex-shrink-0" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

const NOTE_TYPE_LABELS: Record<StudyNote["type"], string> = {
  explanation: "Объяснение",
  summary: "Конспект",
  flashcards: "Карточки",
  quiz: "Тест",
  note: "Заметка",
};

function NotesList({ studyNotes, onDelete }: { studyNotes: StudyNote[]; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyNote = (note: StudyNote) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`).then(() => {
      setCopied(note.id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  if (studyNotes.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <StickyNote size={24} className="text-[var(--text-3)] mx-auto mb-2" />
        <p className="text-xs text-[var(--text-3)] leading-relaxed">
          Сохраняй объяснения AI кнопкой <strong>Сохранить</strong> в панели тьютора.
        </p>
      </div>
    );
  }

  return (
    <ul className="px-2 space-y-1.5">
      {studyNotes.map((note) => (
        <li key={note.id}>
          <div className="rounded-xl bg-white shadow-card border border-[var(--border)] overflow-hidden">
            <div className="px-3 pt-2.5 pb-2">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                  {NOTE_TYPE_LABELS[note.type]}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyNote(note)}
                    className="p-1 rounded hover:bg-black/5 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
                    title="Скопировать"
                  >
                    {copied === note.id ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-1 rounded hover:bg-red-50 text-[var(--text-3)] hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <p className="text-[12px] font-medium text-[var(--text-1)] leading-snug line-clamp-2">
                {note.title}
              </p>
              <p className="text-[11.5px] text-[var(--text-2)] mt-1 line-clamp-3 leading-relaxed">
                {note.content}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
