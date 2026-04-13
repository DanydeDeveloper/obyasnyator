"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}

export function Modal({ open, onClose, title, subtitle, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-in" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-modal flex flex-col overflow-hidden animate-slide-up",
          size === "md" ? "max-w-lg max-h-[85vh]" : "max-w-2xl max-h-[90vh]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-1)]">{title}</h2>
            {subtitle && (
              <p className="text-xs text-[var(--text-3)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-black/5 transition-colors -mr-1 -mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
