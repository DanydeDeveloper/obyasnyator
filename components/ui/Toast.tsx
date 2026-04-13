"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, variant = "success", onDismiss, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Animate out then dismiss
    const t2 = setTimeout(() => setVisible(false), duration - 300);
    const t3 = setTimeout(onDismiss, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={15} className="text-emerald-500" />,
    error: <AlertCircle size={15} className="text-red-500" />,
    info: <CheckCircle2 size={15} className="text-brand-500" />,
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-sm shadow-modal transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {icons[variant]}
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-1 text-white/50 hover:text-white transition-colors">
        <X size={13} />
      </button>
    </div>
  );
}

// Simple hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const show = (message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
  };

  const dismiss = () => setToast(null);

  return { toast, show, dismiss };
}
