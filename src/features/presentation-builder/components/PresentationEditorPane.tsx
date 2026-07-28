import { useRef, useState } from "react";
import {
  PRESENTATION_KINDS,
  SLIDE_TYPES,
  SOURCE_KINDS,
  THEMES,
} from "../constants";
import { usePresentationBuilder } from "../hooks/usePresentationBuilder";
import type {
  PresentationKind,
  PresentationSourceKind,
  SlideType,
} from "../types";
import { SlideCanvas } from "./SlideCanvas";
import { StringListEditor } from "./StringListEditor";

export function PresentationEditorPane() {
  const {
    presentation,
    sectionId,
    selectedSlideId,
    setSelectedSlideId,
    patchPresentation,
    addSlide,
    updateSlide,
    removeSlide,
    moveSlide,
    setTheme,
    setPanel,
    setPresenterIndex,
    runAi,
    exportFormat,
  } = usePresentationBuilder();

  const slides = [...presentation.slides].sort((a, b) => a.order - b.order);
  const selected =
    slides.find((s) => s.id === selectedSlideId) ?? slides[0] ?? null;
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (sectionId === "general") {
    return (
      <section>
        <h2 className="pb-section-title">Informații prezentare</h2>
        <p className="pb-lead">
          Prezentările PRIMA se generează din proiecte, lecții, povești, fișe
          și evaluări — nu dintr-un canvas gol.
        </p>
        <div className="pb-grid-2">
          <label className="pb-field">
            Tip prezentare
            <select
              className="pb-select"
              value={presentation.kind}
              onChange={(e) =>
                patchPresentation((prev) => ({
                  ...prev,
                  kind: e.target.value as PresentationKind,
                }))
              }
            >
              {PRESENTATION_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="pb-field">
            Durată estimată (min)
            <input
              className="pb-input"
              type="number"
              min={5}
              value={presentation.estimatedMinutes}
              onChange={(e) =>
                patchPresentation((prev) => ({
                  ...prev,
                  estimatedMinutes: Number(e.target.value) || 10,
                }))
              }
            />
          </label>
          <label className="pb-field">
            Disciplină
            <input
              className="pb-input"
              value={presentation.subject}
              onChange={(e) =>
                patchPresentation((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </label>
          <label className="pb-field">
            Clasă
            <input
              className="pb-input"
              value={presentation.grade}
              onChange={(e) =>
                patchPresentation((prev) => ({
                  ...prev,
                  grade: e.target.value,
                }))
              }
            />
          </label>
        </div>
        <label className="pb-field">
          Note profesor
          <textarea
            className="pb-textarea"
            value={presentation.teacherNotes}
            onChange={(e) =>
              patchPresentation((prev) => ({
                ...prev,
                teacherNotes: e.target.value,
              }))
            }
          />
        </label>
        <div className="pb-meta">
          <span className="pb-chip">
            Lesson: {presentation.lessonId ?? "opțional"}
          </span>
          <span className="pb-chip">Project: {presentation.projectId}</span>
        </div>
        <h3 className="pb-section-title" style={{ fontSize: "1.1rem" }}>
          Obiective
        </h3>
        <StringListEditor
          items={[...presentation.objectives]}
          onChange={(objectives) =>
            patchPresentation((prev) => ({ ...prev, objectives }))
          }
        />
        <h3 className="pb-section-title" style={{ fontSize: "1.1rem" }}>
          Competențe
        </h3>
        <StringListEditor
          items={[...presentation.competencies]}
          onChange={(competencies) =>
            patchPresentation((prev) => ({ ...prev, competencies }))
          }
        />
      </section>
    );
  }

  if (sectionId === "source") {
    return (
      <section>
        <h2 className="pb-section-title">Sursă PRIMA</h2>
        <p className="pb-lead">
          Generează din lecție, poveste, fișă, evaluare sau proiect.
        </p>
        <div className="pb-card">
          <strong>Sursă curentă:</strong> {presentation.source.label}
          <div className="pb-kicker">{presentation.source.kind}</div>
        </div>
        <label className="pb-field">
          Tip sursă
          <select
            className="pb-select"
            value={presentation.source.kind}
            onChange={(e) =>
              patchPresentation((prev) => ({
                ...prev,
                source: {
                  ...prev.source,
                  kind: e.target.value as PresentationSourceKind,
                  label:
                    SOURCE_KINDS.find((s) => s.id === e.target.value)?.label ??
                    prev.source.label,
                },
              }))
            }
          >
            {SOURCE_KINDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="pb-actions">
          <button
            type="button"
            className="pb-btn pb-btn-primary"
            onClick={() => runAi("generate_entire")}
          >
            Generează întreaga prezentare
          </button>
          <button
            type="button"
            className="pb-btn"
            onClick={() => runAi("summarize_lesson")}
          >
            Rezumă lecția
          </button>
          <button
            type="button"
            className="pb-btn"
            onClick={() => runAi("adapt_presentation")}
          >
            Adaptează tipul
          </button>
        </div>
      </section>
    );
  }

  if (sectionId === "outline" || sectionId === "slides") {
    return (
      <section>
        <h2 className="pb-section-title">
          {sectionId === "outline" ? "Outline" : "Editor slide-uri"}
        </h2>
        <p className="pb-lead">
          Drag & drop pentru reordonare. Selectează un slide pentru editare.
        </p>
        <div className="pb-actions" style={{ marginBottom: "0.85rem" }}>
          {SLIDE_TYPES.slice(0, 8).map((t) => (
            <button
              key={t.id}
              type="button"
              className="pb-btn"
              onClick={() => addSlide(t.id)}
            >
              + {t.label}
            </button>
          ))}
          <label className="pb-field" style={{ margin: 0, minWidth: "10rem" }}>
            Alt tip
            <select
              className="pb-select"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                addSlide(e.target.value as SlideType);
                e.target.value = "";
              }}
            >
              <option value="">Adaugă…</option>
              {SLIDE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="pb-slide-layout">
          <div>
            {selected ? (
              <>
                <SlideCanvas
                  slide={selected}
                  themeId={presentation.themeId}
                />
                <div className="pb-card" style={{ marginTop: "1rem" }}>
                  <div className="pb-grid-2">
                    <label className="pb-field">
                      Tip slide
                      <select
                        className="pb-select"
                        value={selected.type}
                        onChange={(e) =>
                          updateSlide(selected.id, {
                            type: e.target.value as SlideType,
                          })
                        }
                      >
                        {SLIDE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="pb-field">
                      Durată (sec)
                      <input
                        className="pb-input"
                        type="number"
                        min={15}
                        value={selected.estimatedSeconds}
                        onChange={(e) =>
                          updateSlide(selected.id, {
                            estimatedSeconds: Number(e.target.value) || 45,
                          })
                        }
                      />
                    </label>
                  </div>
                  <label className="pb-field">
                    Titlu
                    <input
                      className="pb-input"
                      value={selected.title}
                      onChange={(e) =>
                        updateSlide(selected.id, { title: e.target.value })
                      }
                    />
                  </label>
                  <label className="pb-field">
                    Conținut
                    <textarea
                      className="pb-textarea"
                      value={selected.body}
                      onChange={(e) =>
                        updateSlide(selected.id, { body: e.target.value })
                      }
                    />
                  </label>
                  <div className="pb-kicker" style={{ marginBottom: "0.35rem" }}>
                    Bullet-uri
                  </div>
                  <StringListEditor
                    items={[...selected.bullets]}
                    onChange={(bullets) =>
                      updateSlide(selected.id, { bullets })
                    }
                  />
                  <label className="pb-field" style={{ marginTop: "0.75rem" }}>
                    Note vorbitor
                    <textarea
                      className="pb-textarea"
                      value={selected.speakerNotes}
                      onChange={(e) =>
                        updateSlide(selected.id, {
                          speakerNotes: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="pb-field">
                    Sugestie animație
                    <input
                      className="pb-input"
                      value={selected.animationSuggestion ?? ""}
                      onChange={(e) =>
                        updateSlide(selected.id, {
                          animationSuggestion: e.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="pb-actions">
                    <button
                      type="button"
                      className="pb-btn pb-btn-danger"
                      onClick={() => {
                        if (window.confirm("Ștergi slide-ul?")) {
                          removeSlide(selected.id);
                        }
                      }}
                    >
                      Șterge slide
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pb-empty">
                Adaugă primul slide sau generează cu AI.
              </div>
            )}
          </div>

          <div>
            <div className="pb-kicker" style={{ marginBottom: "0.45rem" }}>
              Outline · drag & drop
            </div>
            <div className="pb-outline">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  draggable
                  className={[
                    "pb-outline-item",
                    selected?.id === s.id ? "is-active" : "",
                    dragOver === index ? "is-dragging" : "",
                  ].join(" ")}
                  onClick={() => setSelectedSlideId(s.id)}
                  onDragStart={() => {
                    dragFrom.current = index;
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(index);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = dragFrom.current;
                    setDragOver(null);
                    dragFrom.current = null;
                    if (from == null || from === index) return;
                    moveSlide(from, index);
                  }}
                >
                  <span className="pb-outline-num">{index + 1}</span>
                  <span>
                    <div className="pb-outline-title">
                      {s.title || "Fără titlu"}
                    </div>
                    <div className="pb-outline-type">
                      {SLIDE_TYPES.find((t) => t.id === s.type)?.label ??
                        s.type}{" "}
                      · {s.estimatedSeconds}s
                    </div>
                  </span>
                  <span className="pb-chip">⋮⋮</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sectionId === "theme") {
    return (
      <section>
        <h2 className="pb-section-title">Theme Manager</h2>
        <p className="pb-lead">
          Alege o temă vizuală pentru clasă — contrast, laborator, poveste.
        </p>
        <div className="pb-theme-grid">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={[
                "pb-theme-card",
                presentation.themeId === theme.id ? "is-active" : "",
              ].join(" ")}
              onClick={() => setTheme(theme.id)}
            >
              <div
                className="pb-theme-swatch"
                style={{
                  background: `linear-gradient(135deg, ${theme.background}, ${theme.surface})`,
                  boxShadow: `inset 0 -4px 0 ${theme.accent}`,
                }}
              />
              <strong>{theme.name}</strong>
              <div className="pb-kicker">{theme.fontDisplay}</div>
            </button>
          ))}
        </div>
        {selected ? (
          <div style={{ marginTop: "1.25rem" }}>
            <div className="pb-kicker" style={{ marginBottom: "0.5rem" }}>
              Preview temă
            </div>
            <SlideCanvas slide={selected} themeId={presentation.themeId} />
          </div>
        ) : null}
      </section>
    );
  }

  if (sectionId === "notes") {
    return (
      <section>
        <h2 className="pb-section-title">Note vorbitor</h2>
        <p className="pb-lead">
          Completează notele pe fiecare slide sau generează-le cu AI.
        </p>
        <div className="pb-actions" style={{ marginBottom: "0.85rem" }}>
          <button
            type="button"
            className="pb-btn pb-btn-primary"
            onClick={() => runAi("generate_speaker_notes")}
          >
            Generează note
          </button>
        </div>
        {slides.map((s, i) => (
          <div key={s.id} className="pb-card">
            <div className="pb-card-head">
              <strong>
                {i + 1}. {s.title}
              </strong>
              <span className="pb-chip">{s.type}</span>
            </div>
            <textarea
              className="pb-textarea"
              value={s.speakerNotes}
              onChange={(e) =>
                updateSlide(s.id, { speakerNotes: e.target.value })
              }
            />
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "media") {
    return (
      <section>
        <h2 className="pb-section-title">Multimedia</h2>
        <p className="pb-lead">
          Imagini, video, iconuri, chart-uri, tabele, audio — ca sugestii pe
          slide.
        </p>
        <div className="pb-actions" style={{ marginBottom: "0.85rem" }}>
          <button
            type="button"
            className="pb-btn"
            onClick={() => runAi("generate_visual_suggestions")}
          >
            Sugestii vizuale
          </button>
          <button
            type="button"
            className="pb-btn"
            onClick={() => runAi("generate_diagrams")}
          >
            Diagrame
          </button>
          <button
            type="button"
            className="pb-btn"
            onClick={() => runAi("generate_animation_suggestions")}
          >
            Animații
          </button>
        </div>
        {slides.map((s, i) => (
          <div key={s.id} className="pb-card">
            <div className="pb-card-head">
              <strong>
                {i + 1}. {s.title}
              </strong>
              <button
                type="button"
                className="pb-btn"
                onClick={() =>
                  updateSlide(s.id, {
                    media: [
                      ...s.media,
                      {
                        kind: "image",
                        label: "Imagine nouă",
                        promptOrUrl: "Descriere vizuală pentru clasă",
                      },
                    ],
                  })
                }
              >
                + Media
              </button>
            </div>
            {s.media.length === 0 ? (
              <div className="pb-kicker">Fără media pe acest slide.</div>
            ) : (
              s.media.map((m, mi) => (
                <div key={`${mi}-${m.label}`} className="pb-grid-2">
                  <label className="pb-field">
                    Tip
                    <select
                      className="pb-select"
                      value={m.kind}
                      onChange={(e) => {
                        const next = [...s.media];
                        next[mi] = {
                          ...m,
                          kind: e.target.value as typeof m.kind,
                        };
                        updateSlide(s.id, { media: next });
                      }}
                    >
                      {(
                        [
                          "image",
                          "video",
                          "icon",
                          "chart",
                          "table",
                          "audio",
                        ] as const
                      ).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="pb-field">
                    Etichetă
                    <input
                      className="pb-input"
                      value={m.label}
                      onChange={(e) => {
                        const next = [...s.media];
                        next[mi] = { ...m, label: e.target.value };
                        updateSlide(s.id, { media: next });
                      }}
                    />
                  </label>
                  <label className="pb-field" style={{ gridColumn: "1 / -1" }}>
                    Prompt / URL
                    <input
                      className="pb-input"
                      value={m.promptOrUrl ?? ""}
                      onChange={(e) => {
                        const next = [...s.media];
                        next[mi] = { ...m, promptOrUrl: e.target.value };
                        updateSlide(s.id, { media: next });
                      }}
                    />
                  </label>
                </div>
              ))
            )}
            {s.animationSuggestion ? (
              <div className="pb-kicker" style={{ marginTop: "0.5rem" }}>
                Animație: {s.animationSuggestion}
              </div>
            ) : null}
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "preview") {
    return (
      <section>
        <h2 className="pb-section-title">Preview</h2>
        <p className="pb-lead">Parcurge slide-urile în tema selectată.</p>
        <div style={{ display: "grid", gap: "1rem" }}>
          {slides.map((s, i) => (
            <div key={s.id}>
              <div className="pb-kicker" style={{ marginBottom: "0.35rem" }}>
                Slide {i + 1} · {s.type}
              </div>
              <SlideCanvas slide={s} themeId={presentation.themeId} />
            </div>
          ))}
          {slides.length === 0 ? (
            <div className="pb-empty">Niciun slide de previzualizat.</div>
          ) : null}
        </div>
      </section>
    );
  }

  if (sectionId === "presenter") {
    const startIndex = Math.max(
      0,
      slides.findIndex((s) => s.id === selected?.id),
    );
    return (
      <section>
        <h2 className="pb-section-title">Presenter Mode</h2>
        <p className="pb-lead">
          Mod prezentare pe ecran întreg: slide + note vorbitor. Săgeți /
          Spațiu / Esc.
        </p>
        <button
          type="button"
          className="pb-btn pb-btn-primary"
          onClick={() => {
            setPresenterIndex(startIndex < 0 ? 0 : startIndex);
            setPanel("presenter");
          }}
        >
          Pornește Presenter Mode
        </button>
      </section>
    );
  }

  if (sectionId === "export") {
    return (
      <section>
        <h2 className="pb-section-title">Export</h2>
        <p className="pb-lead">
          PPTX (outline), PDF (print HTML), Interactive HTML, Presenter,
          Student, Print.
        </p>
        <div className="pb-actions" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          {(
            [
              "pptx",
              "pdf",
              "html",
              "presenter",
              "student",
              "print",
            ] as const
          ).map((format) => (
            <button
              key={format}
              type="button"
              className="pb-btn pb-btn-primary"
              onClick={() => exportFormat(format)}
            >
              Export {format.toUpperCase()}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (sectionId === "metadata") {
    return (
      <section>
        <h2 className="pb-section-title">Metadate</h2>
        <pre className="pb-pre">
          {JSON.stringify(
            {
              id: presentation.id,
              projectId: presentation.projectId,
              lessonId: presentation.lessonId,
              workspaceArtifactId: presentation.workspaceArtifactId,
              version: presentation.version,
              status: presentation.status,
              locale: presentation.locale,
              themeId: presentation.themeId,
              source: presentation.source,
              metadata: presentation.metadata,
              validation: presentation.validation,
            },
            null,
            2,
          )}
        </pre>
      </section>
    );
  }

  return null;
}
