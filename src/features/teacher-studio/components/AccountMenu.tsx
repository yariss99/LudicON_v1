import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate("/welcome", { replace: true });
  }

  return (
    <div className="ts-account" ref={rootRef}>
      <button
        type="button"
        className="ts-account-btn"
        aria-label={`Cont: ${user.displayName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ts-account-avatar" aria-hidden>
          {initials(user.displayName)}
        </span>
        <span className="ts-account-name">{user.displayName}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open ? (
        <div id={menuId} className="ts-account-menu" role="menu" aria-label="Cont">
          <p className="ts-account-meta">
            <span className="ts-account-meta-name">{user.displayName}</span>
            <span className="ts-account-meta-email">{user.email}</span>
          </p>
          <Link
            to="/settings"
            role="menuitem"
            className="ts-account-item"
            onClick={() => setOpen(false)}
          >
            <Settings size={15} aria-hidden />
            Setări
          </Link>
          <button
            type="button"
            role="menuitem"
            className="ts-account-item"
            onClick={() => {
              void handleSignOut();
            }}
          >
            <LogOut size={15} aria-hidden />
            Delogare
          </button>
        </div>
      ) : null}
    </div>
  );
}
