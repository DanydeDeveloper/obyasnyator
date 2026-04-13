// ─── Document ────────────────────────────────────────────────────────────────

export interface DocumentChunk {
  id: string;
  text: string;
  /** Human-readable label, e.g. "Page 3" or "Section: Introduction" */
  label: string;
  /** Sequential index within the document */
  index: number;
}

export interface ProcessedDocument {
  id: string;
  name: string;
  /** Full extracted text (may be truncated for very large docs) */
  fullText: string;
  chunks: DocumentChunk[];
  /** Number of source pages or sections */
  pageCount?: number;
  uploadedAt: string;
}

// ─── Tutor ────────────────────────────────────────────────────────────────────

export type TutorMode = "chat" | "quiz" | "flashcards" | "practice";

export type MessageRole = "user" | "assistant";

export interface TutorMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** Timestamp ISO string */
  createdAt: string;
  /** Source chunks referenced in this response */
  sourceChunkIds?: string[];
}

// ─── Study Tools ─────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface PracticeProblem {
  id: string;
  question: string;
  hints: string[];
  solution: string;
}

// ─── Study Notes ─────────────────────────────────────────────────────────────

export type StudyNoteType = "explanation" | "summary" | "flashcards" | "quiz" | "note";

export interface StudyNote {
  id: string;
  type: StudyNoteType;
  title: string;
  content: string;
  savedAt: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppSession {
  document: ProcessedDocument | null;
  messages: TutorMessage[];
  studyNotes: StudyNote[];
  activeSectionIndex: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  document: ProcessedDocument;
}

export interface TutorRequest {
  message: string;
  chunks: DocumentChunk[];
  history: Array<{ role: MessageRole; content: string }>;
  /** Optional: highlighted text to explain */
  selectedText?: string;
  mode?: TutorMode;
}

export interface TutorResponse {
  content: string;
  sourceChunkIds: string[];
}

export interface QuizRequest {
  chunks: DocumentChunk[];
  count?: number;
}

export interface FlashcardsRequest {
  chunks: DocumentChunk[];
  count?: number;
}

export interface PracticeRequest {
  chunks: DocumentChunk[];
  count?: number;
}
