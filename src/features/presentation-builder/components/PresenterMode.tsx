import { useEffect } from "react";
import { usePresentationBuilder } from "../hooks/usePresentationBuilder";
import { SlideCanvas } from "./SlideCanvas";

export function PresenterMode({ onClose }: { onClose: () => void }) {
  const {
    presentation,
    presenterIndex,
    setPresenterIndex,
  } = usePresentationBuilder();
  const slides = [...presentation.slides].sort((a, b) => a.order - b.order);
  const index = Math.min(
    Math.max(0, presenterIndex),
    Math.max(0, slides.length - 1),
  );
  const slide = slides[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setPresenterIndex(Math.min(index + 1, slides.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setPresenterIndex(Math.max(index - 1, 0));
      }
      if (e.key === "Home") setPresenterIndex(0);
      if (e.key === "End") setPresenterIndex(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, setPresenterIndex, slides.length]);

  if (!slide) {
    return (
      <div className="pb-presenter" role="dialog" aria-label="Presenter Mode">
        <div className="pb-presenter-stage">
          <p>Nu există slide-uri.</p>
        </div>
        <div className="pb-presenter-bar">
          <button type="button" className="pb-btn" onClick={onClose}>
            Închide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-presenter" role="dialog" aria-label="Presenter Mode">
      <div className="pb-presenter-stage">
        <SlideCanvas slide={slide} themeId={presentation.themeId} />
      </div>
      <div className="pb-presenter-bar">
        <div>
          <div className="pb-kicker" style={{ color: "#94a3b8" }}>
            {index + 1} / {slides.length} · {presentation.title}
          </div>
          <div className="pb-presenter-notes">
            {slide.speakerNotes || "Fără note vorbitor pe acest slide."}
          </div>
        </div>
        <div className="pb-actions">
          <button
            type="button"
            className="pb-btn"
            disabled={index <= 0}
            onClick={() => setPresenterIndex(index - 1)}
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="pb-btn pb-btn-primary"
            disabled={index >= slides.length - 1}
            onClick={() => setPresenterIndex(index + 1)}
          >
            Următor →
          </button>
          <button type="button" className="pb-btn" onClick={onClose}>
            Ieșire (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
