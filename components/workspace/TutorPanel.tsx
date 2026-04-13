"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, BookMarked, HelpCircle, Layers, Dumbbell, ChevronRight, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { makeMessage, makeStudyNote } from "@/lib/session";
import type { TutorMessage, StudyNote, ProcessedDocument } from "@/types";

interface TutorPanelProps {
  document: ProcessedDocument;
  messages: TutorMessage[];
  onMessagesChange: (msgs: TutorMessage[]) => void;
  onSaveNote: (note: StudyNote) => void;
  pendingExplain?: string | null;
  onPendingExplainConsumed: () => void;
  onOpenQuiz: () => void;
  onOpenFlashcards: () => void;
  onOpenPractice: () => void;
}

const EXPLAIN_PROMPT = "Объясни главные идеи этого материала простыми словами, шаг за шагом.";

export function TutorPanel({
  document,
  messages,
  onMessagesChange,
  onSaveNote,
  pendingExplain,
  onPendingExplainConsumed,
  onOpenQuiz,
  onOpenFlashcards,
  onOpenPractice,
}: TutorPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (pendingExplain) {
      sendMessage(`Объясни это простыми словами:\n\n"${pendingExplain}"`);
      onPendingExplainConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingExplain]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setInput("");

      const userMsg = makeMessage("user", trimmed);
      const nextMessages = [...messages, userMsg];
      onMessagesChange(nextMessages);
      setLoading(true);

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            chunks: document.chunks,
            history: nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "AI тьютор недоступен. Попробуй ещё раз.");
        }

        const { content, sourceChunkIds } = await res.json();
        const assistantMsg = makeMessage("assistant", content, sourceChunkIds);
        onMessagesChange([...nextMessages, assistantMsg]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Что-то пошло не так.");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, document.chunks, onMessagesChange]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const saveLastResponse = () => {
    const lastAI = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAI) return;
    const note = makeStudyNote(
      "explanation",
      lastAI.content.slice(0, 60).trimEnd() + "…",
      lastAI.content
    );
    onSaveNote(note);
  };

  return (
    <div className="flex flex-col h-full border-l border-[var(--border)] bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <Bot size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-1)]">AI Тьютор</span>
        </div>
        <button
          onClick={saveLastResponse}
          title="Сохранить последний ответ в заметки"
          className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-brand-600 transition-colors px-2 py-1 rounded-md hover:bg-brand-50"
        >
          <BookMarked size={13} />
          Сохранить
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex gap-1.5 flex-wrap">
        <QuickBtn icon={<Sparkles size={13} />} disabled={loading} onClick={() => sendMessage(EXPLAIN_PROMPT)}>
          Объяснить
        </QuickBtn>
        <QuickBtn icon={<HelpCircle size={13} />} onClick={onOpenQuiz}>
          Квиз
        </QuickBtn>
        <QuickBtn icon={<Layers size={13} />} onClick={onOpenFlashcards}>
          Карточки
        </QuickBtn>
        <QuickBtn icon={<Dumbbell size={13} />} onClick={onOpenPractice}>
          Практика
        </QuickBtn>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.length === 0 && (
          <EmptyState docName={document.name} onAction={sendMessage} />
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[var(--bg-base)] text-sm text-[var(--text-3)]">
              <Spinner size="sm" />
              <span>Думаю…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-[var(--border)]">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спроси что-нибудь о твоих конспектах…"
            className="flex-1 resize-none rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 leading-relaxed max-h-40 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={loading}
            disabled={!input.trim()}
            className="flex-shrink-0 h-[42px] w-[42px] p-0"
          >
            {!loading && <Send size={15} />}
          </Button>
        </form>
        <p className="text-[11px] text-[var(--text-3)] mt-1.5 text-center">
          Ответы основаны на твоём загруженном материале
        </p>
      </div>
    </div>
  );
}

function QuickBtn({
  icon, children, onClick, disabled,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-2)] bg-[var(--bg-base)] hover:bg-brand-50 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--border)]"
    >
      {icon}
      {children}
    </button>
  );
}

function MessageBubble({ message }: { message: TutorMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
        isUser ? "bg-[var(--bg-base)] border border-[var(--border)]" : "bg-brand-600"
      )}>
        {isUser ? <User size={12} className="text-[var(--text-2)]" /> : <Bot size={12} className="text-white" />}
      </div>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
        isUser ? "bg-brand-600 text-white rounded-tr-sm" : "bg-[var(--bg-base)] text-[var(--text-1)] rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-ai" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ docName, onAction }: { docName: string; onAction: (prompt: string) => void }) {
  const suggestions = [
    "Какие главные идеи в этом материале?",
    "Объясни самое важное понятие простыми словами.",
    "На что обратить внимание, чтобы понять тему?",
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={12} className="text-white" />
        </div>
        <div className="bg-[var(--bg-base)] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-1)]">
          <p>Привет! Я прочитал <strong>{docName.replace(/\.[^.]+$/, "")}</strong>. Готов помочь разобраться в материале и потренироваться.</p>
          <p className="mt-1.5 text-[var(--text-2)]">Используй кнопки выше или задай вопрос ниже.</p>
        </div>
      </div>
      <div className="space-y-1.5 pl-8">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onAction(s)}
            className="w-full flex items-center gap-2 text-left text-xs text-[var(--text-2)] hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors border border-[var(--border)] bg-white"
          >
            <ChevronRight size={12} className="flex-shrink-0 text-[var(--text-3)]" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/^(?!<[huplid])(.+)$/gm, (m) => (m.startsWith("<") ? m : `<p>${m}</p>`))
    .replace(/<p><\/p>/g, "")
    .trim();
}
