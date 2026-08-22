import { Moon, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "./ThemeContext";
import type { AppTheme } from "./theme";

type ThemeToggleProps = {
  /** Icon-only trigger with a compact menu — used in headers. */
  readonly variant?: "icon" | "panel";
  /** Hide the current-mode label on the trigger (popover still names both). */
  readonly compact?: boolean;
  readonly className?: string;
};

const OPTIONS: ReadonlyArray<{
  id: AppTheme;
  label: string;
  hint: string;
}> = [
  { id: "light", label: "Luminos", hint: "Atelier de zi" },
  { id: "dark", label: "Întunecat", hint: "Atelier de seară" },
];

export function ThemeToggle({
  variant = "icon",
  compact = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "panel") {
    return (
      <div
        className={["lx-theme-panel", className].filter(Boolean).join(" ")}
        role="group"
        aria-label="Aspect"
      >
        {OPTIONS.map((option) => {
          const selected = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className="lx-theme-choice"
              aria-pressed={selected}
              onClick={() => setTheme(option.id)}
            >
              {option.id === "dark" ? (
                <Moon size={18} aria-hidden />
              ) : (
                <Sun size={18} aria-hidden />
              )}
              <span className="lx-theme-choice-label">{option.label}</span>
              <span className="lx-theme-choice-meta">{option.hint}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const current = OPTIONS.find((option) => option.id === theme) ?? OPTIONS[0];

  return (
    <div
      className={["lx-theme", compact ? "is-compact" : "", className]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <button
        type="button"
        className="lx-theme-btn"
        aria-label={`Aspect: ${current.label}. Deschide alegerea temei.`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {theme === "dark" ? (
          <Moon size={15} aria-hidden />
        ) : (
          <Sun size={15} aria-hidden />
        )}
        <span className="lx-theme-btn-label">{current.label}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="lx-theme-menu"
          role="menu"
          aria-label="Alege aspectul"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.id}
              className="lx-theme-option"
              onClick={() => {
                setTheme(option.id);
                setOpen(false);
              }}
            >
              {option.id === "dark" ? (
                <Moon size={15} aria-hidden />
              ) : (
                <Sun size={15} aria-hidden />
              )}
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
