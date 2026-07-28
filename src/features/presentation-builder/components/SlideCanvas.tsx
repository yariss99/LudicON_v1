import { THEME_BY_ID } from "../constants";
import type { PresentationSlide, PresentationThemeId } from "../types";

type Props = {
  slide: PresentationSlide;
  themeId: PresentationThemeId;
  compact?: boolean;
};

export function SlideCanvas({ slide, themeId, compact }: Props) {
  const theme = THEME_BY_ID[themeId];
  return (
    <div
      className="pb-canvas"
      style={{
        ["--slide-bg" as string]: theme.background,
        ["--slide-surface" as string]: theme.surface,
        ["--slide-accent" as string]: theme.accent,
        ["--slide-text" as string]: theme.text,
        ["--slide-font" as string]: `"${theme.fontDisplay}", serif`,
        padding: compact ? "1.1rem 1.25rem" : undefined,
      }}
    >
      <div className="pb-canvas-type">{slide.type}</div>
      <h3 className="pb-canvas-title">{slide.title || "Slide fără titlu"}</h3>
      {slide.body ? <p className="pb-canvas-body">{slide.body}</p> : null}
      {slide.bullets.length > 0 ? (
        <ul className="pb-canvas-bullets">
          {slide.bullets.map((b, i) => (
            <li key={`${i}-${b.slice(0, 20)}`}>{b}</li>
          ))}
        </ul>
      ) : null}
      {slide.media.length > 0 ? (
        <div className="pb-canvas-media">
          {slide.media.map((m, i) => (
            <span key={`${m.kind}-${i}`}>
              {m.kind}: {m.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
