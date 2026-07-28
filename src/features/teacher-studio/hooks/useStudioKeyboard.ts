import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeacherStudio } from "../context/TeacherStudioContext";

/**
 * Global shortcuts for Teacher Studio.
 * G then letter = go to area; [ = toggle PRIMA assistant; ? = help via settings.
 */
export function useStudioKeyboard() {
  const navigate = useNavigate();
  const { toggleAssistant, setMobileNavOpen } = useTeacherStudio();

  useEffect(() => {
    let pendingG = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "[" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        toggleAssistant();
        return;
      }

      if (event.key === "Escape") {
        setMobileNavOpen(false);
        return;
      }

      const key = event.key.toLowerCase();
      if (pendingG) {
        pendingG = false;
        if (timer) clearTimeout(timer);
        const map: Record<string, string> = {
          h: "/",
          p: "/projects",
          l: "/library",
          a: "/activity",
          c: "/calendar",
          n: "/notifications",
          s: "/settings",
        };
        const href = map[key];
        if (href) {
          event.preventDefault();
          navigate(href);
        }
        return;
      }

      if (key === "g" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        pendingG = true;
        timer = setTimeout(() => {
          pendingG = false;
        }, 800);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [navigate, toggleAssistant, setMobileNavOpen]);
}
