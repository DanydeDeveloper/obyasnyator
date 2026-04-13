"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Download, ArrowLeft, Menu, X } from "lucide-react";
import { MaterialsSidebar } from "@/components/workspace/MaterialsSidebar";
import { DocumentViewer } from "@/components/workspace/DocumentViewer";
import { TutorPanel } from "@/components/workspace/TutorPanel";
import { QuizModal } from "@/components/workspace/QuizModal";
import { FlashcardsModal } from "@/components/workspace/FlashcardsModal";
import { PracticeModal } from "@/components/workspace/PracticeModal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Toast, useToast } from "@/components/ui/Toast";
import { MOCK_DOCUMENT, MOCK_MESSAGES, MOCK_STUDY_NOTES } from "@/lib/mock-data";
import { loadSession, saveSession, makeStudyNote } from "@/lib/session";
import type { ProcessedDocument, TutorMessage, StudyNote } from "@/types";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const router = useRouter();

  const [doc, setDoc] = useState<ProcessedDocument | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"document" | "notes">("document");
  const [pendingExplain, setPendingExplain] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<null | "quiz" | "flashcards" | "practice">(null);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // ── Load document from sessionStorage (or demo) ───────────────────────────
  useEffect(() => {
    const isDemo = sessionStorage.getItem("__demo__");
    const rawDoc = sessionStorage.getItem("__doc__");

    if (isDemo) {
      sessionStorage.removeItem("__demo__");
      setDoc(MOCK_DOCUMENT);
      setMessages(MOCK_MESSAGES);
      setStudyNotes(MOCK_STUDY_NOTES);
      setLoading(false);
      return;
    }

    if (rawDoc) {
      try {
        const parsedDoc: ProcessedDocument = JSON.parse(rawDoc);
        setDoc(parsedDoc);

        const session = loadSession(parsedDoc.id);
        if (session) {
          setMessages(session.messages);
          setStudyNotes(session.studyNotes);
          setActiveSectionIndex(session.activeSectionIndex);
        }
      } catch {
        // Corrupt storage — redirect back
        router.push("/");
      }
      setLoading(false);
      return;
    }

    // Nothing in storage — redirect to landing
    router.push("/");
  }, [router]);

  // ── Persist session on changes ────────────────────────────────────────────
  useEffect(() => {
    if (!doc) return;
    saveSession(doc.id, {
      document: doc,
      messages,
      studyNotes,
      activeSectionIndex,
    });
  }, [doc, messages, studyNotes, activeSectionIndex]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveNote = useCallback((note: StudyNote) => {
    setStudyNotes((prev) => [note, ...prev]);
    setSidebarTab("notes");
    showToast("Saved to Study Notes");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setStudyNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleExplainSelection = useCallback((text: string) => {
    setPendingExplain(text);
  }, []);

  const handleExport = () => {
    if (!doc || studyNotes.length === 0) return;
    const md = [
      `# Study Notes — ${doc.name.replace(/\.[^.]+$/, "")}`,
      `_Exported ${new Date().toLocaleDateString()}_\n`,
      ...studyNotes.map((n) => `## ${n.title}\n\n${n.content}`),
    ].join("\n\n---\n\n");

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-notes-${doc.name.replace(/\.[^.]+$/, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${studyNotes.length} notes as Markdown`);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-2)]">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-white z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-px h-4 bg-[var(--border)]" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <BookOpen size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-1)] max-w-[240px] truncate">
              {doc.name.replace(/\.[^.]+$/, "")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={studyNotes.length === 0}
            title={studyNotes.length === 0 ? "Save some notes first" : "Export study notes"}
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export notes</span>
          </Button>

          {/* Mobile toggles */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="sm:hidden p-1.5 rounded-md hover:bg-gray-100 text-[var(--text-2)]"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200 overflow-hidden",
            sidebarOpen ? "w-60" : "w-0"
          )}
        >
          <MaterialsSidebar
            document={doc}
            activeSectionIndex={activeSectionIndex}
            onSectionClick={setActiveSectionIndex}
            studyNotes={studyNotes}
            onDeleteNote={handleDeleteNote}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
          />
        </div>

        {/* Document */}
        <main className="flex-1 overflow-hidden">
          <DocumentViewer
            document={doc}
            activeSectionIndex={activeSectionIndex}
            onSectionVisible={setActiveSectionIndex}
            onExplainSelection={handleExplainSelection}
          />
        </main>

        {/* Tutor */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200 overflow-hidden",
            tutorOpen ? "w-[360px]" : "w-0"
          )}
        >
          <TutorPanel
            document={doc}
            messages={messages}
            onMessagesChange={setMessages}
            onSaveNote={handleSaveNote}
            pendingExplain={pendingExplain}
            onPendingExplainConsumed={() => setPendingExplain(null)}
            onOpenQuiz={() => setOpenModal("quiz")}
            onOpenFlashcards={() => setOpenModal("flashcards")}
            onOpenPractice={() => setOpenModal("practice")}
          />
        </div>
      </div>

      {/* Modals */}
      <QuizModal
        open={openModal === "quiz"}
        onClose={() => setOpenModal(null)}
        docName={doc.name}
        chunks={doc.chunks}
      />
      <FlashcardsModal
        open={openModal === "flashcards"}
        onClose={() => setOpenModal(null)}
        docName={doc.name}
        chunks={doc.chunks}
      />
      <PracticeModal
        open={openModal === "practice"}
        onClose={() => setOpenModal(null)}
        docName={doc.name}
        chunks={doc.chunks}
      />

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
