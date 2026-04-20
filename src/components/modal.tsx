"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-[rgba(12,14,18,0.4)] backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="surface-card relative z-10 max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] p-5 md:p-8"
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-xs text-[var(--ink-soft)]">Innovare Action</p>
                <h3 className="display-title mt-2 text-3xl font-semibold text-[var(--ink)]">
                  {title}
                </h3>
                {description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                className="cta-light rounded-full px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-white"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
