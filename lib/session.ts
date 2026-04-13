import type { AppSession, TutorMessage, StudyNote } from "@/types";
import { generateId } from "./utils";

const SESSION_KEY = "obyasnyator_session";

export function loadSession(docId: string): AppSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}_${docId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}

export function saveSession(docId: string, session: AppSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${SESSION_KEY}_${docId}`, JSON.stringify(session));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function makeMessage(
  role: TutorMessage["role"],
  content: string,
  sourceChunkIds?: string[]
): TutorMessage {
  return {
    id: generateId(),
    role,
    content,
    createdAt: new Date().toISOString(),
    sourceChunkIds,
  };
}

export function makeStudyNote(
  type: StudyNote["type"],
  title: string,
  content: string
): StudyNote {
  return {
    id: generateId(),
    type,
    title,
    content,
    savedAt: new Date().toISOString(),
  };
}
