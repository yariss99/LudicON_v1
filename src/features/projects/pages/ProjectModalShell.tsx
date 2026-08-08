import type { FormEvent, ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type ProjectModalShellProps = {
  open: boolean;
  title: string;
  lead?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export function ProjectModalShell({
  open,
  title,
  lead,
  onClose,
  children,
  footer,
}: ProjectModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="pm-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="pm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-modal-title"
      >
        <h2 id="pm-modal-title">{title}</h2>
        {lead ? <p className="pm-modal-lead">{lead}</p> : null}
        {children}
        <div className="pm-modal-actions">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

export function stopFormSubmit(event: FormEvent) {
  event.preventDefault();
}
