import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  Gamepad2,
  NotebookPen,
  Presentation,
  ScrollText,
} from "lucide-react";
import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { getProjectColor } from "../../projects/constants";
import { CREATE_OPTIONS } from "../constants/navigation";
import { useTeacherStudio } from "../context/TeacherStudioContext";
import type { CreateOption, CreateOptionId } from "../types";

/** Accent comes from the real project colour registry, not a parallel palette. */
function accentStyle(option: CreateOption): CSSProperties {
  return { "--ts-c": getProjectColor(option.color).swatch } as CSSProperties;
}

const ICONS: Record<CreateOptionId, typeof NotebookPen> = {
  lesson: NotebookPen,
  worksheet: FileText,
  game: Gamepad2,
  story: ScrollText,
  assessment: ClipboardCheck,
  presentation: Presentation,
};

function isSupported(option: CreateOption): boolean {
  return option.builderPath !== null;
}

export function StudioQuickCreatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { createProject, isTitleTaken } = useProjects();
  const { setActiveProjectId } = useTeacherStudio();

  const requested = params.get("type");
  const initial = CREATE_OPTIONS.find(
    (option) => option.id === requested && isSupported(option),
  );

  const [selectedId, setSelectedId] = useState<CreateOptionId | null>(
    initial?.id ?? null,
  );
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => CREATE_OPTIONS.find((option) => option.id === selectedId) ?? null,
    [selectedId],
  );

  const SelectedIcon = selected ? ICONS[selected.id] : null;

  const trimmedTitle = title.trim();
  const duplicate = trimmedTitle.length > 0 && isTitleTaken(trimmedTitle);
  const canSubmit = Boolean(selected) && trimmedTitle.length > 0 && !duplicate;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected?.builderPath || !canSubmit) return;

    try {
      const project = createProject({
        title: trimmedTitle,
        subject: subject.trim(),
        grade: grade.trim(),
        description: "",
        color: selected.color,
        icon: selected.icon,
        favorite: false,
      });
      setActiveProjectId(project.id);
      navigate(`${selected.builderPath}/${project.id}`);
    } catch {
      setError(
        "Există deja un proiect cu acest titlu. Alege altul și încearcă din nou.",
      );
    }
  }

  return (
    <div>
      <Link to="/" className="ts-qc-back">
        <ArrowLeft size={14} aria-hidden />
        Înapoi
      </Link>

      <header className="ts-qc-head">
        <p className="ts-hero-kicker">Începe un proiect</p>
        <h1 className="ts-hero-title">Ce vrei să creezi?</h1>
        <p className="ts-hero-support">
          Alege un punct de plecare. Poți completa și rafina proiectul în
          continuare.
        </p>
      </header>

      <fieldset className="ts-qc-types">
        <legend className="ts-qc-legend">Tipul materialului</legend>
        <div className="ts-qc-type-grid">
          {CREATE_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const supported = isSupported(option);
            const checked = selectedId === option.id;

            return (
              <label
                key={option.id}
                className={[
                  "ts-qc-type",
                  checked ? "is-selected" : "",
                  supported ? "" : "is-soon",
                ].join(" ")}
                style={accentStyle(option)}
              >
                <input
                  type="radio"
                  name="create-type"
                  value={option.id}
                  className="ts-qc-radio"
                  checked={checked}
                  disabled={!supported}
                  onChange={() => {
                    setSelectedId(option.id);
                    setError(null);
                  }}
                />
                <span className="ts-qc-type-icon" aria-hidden>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className="ts-qc-type-body">
                  <span className="ts-qc-type-label">{option.label}</span>
                  <span className="ts-qc-type-desc">{option.description}</span>
                </span>

                {checked ? (
                  <span className="ts-qc-type-check">
                    <Check size={12} strokeWidth={3} aria-hidden />
                    Selectat
                  </span>
                ) : null}
                {!supported ? (
                  <span className="ts-qc-type-soon">În curând</span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {selected && SelectedIcon ? (
        <form
          className="ts-qc-form"
          onSubmit={handleSubmit}
          style={accentStyle(selected)}
        >
          <div className="ts-qc-form-head">
            <span className="ts-qc-form-mark" aria-hidden>
              <SelectedIcon size={18} strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="ts-block-title">Spune-ne doar câteva lucruri</h2>
              <p className="ts-block-lead">{selected.hint}</p>
            </div>
          </div>

          <div className="ts-qc-fields">
            <label className="ts-qc-field">
              <span className="ts-qc-label">Titlu</span>
              <input
                className="ts-qc-input"
                value={title}
                required
                placeholder="ex. Fracții — evaluare de final de unitate"
                aria-describedby={duplicate ? "qc-title-error" : undefined}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError(null);
                }}
              />
            </label>

            <label className="ts-qc-field">
              <span className="ts-qc-label">
                Disciplină <span className="ts-qc-optional">(opțional)</span>
              </span>
              <input
                className="ts-qc-input"
                value={subject}
                placeholder="ex. Matematică"
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>

            <label className="ts-qc-field">
              <span className="ts-qc-label">
                Clasă <span className="ts-qc-optional">(opțional)</span>
              </span>
              <input
                className="ts-qc-input"
                value={grade}
                placeholder="ex. Clasa a III-a"
                onChange={(event) => setGrade(event.target.value)}
              />
            </label>
          </div>

          {duplicate ? (
            <p id="qc-title-error" className="ts-qc-error" role="alert">
              Ai deja un proiect cu acest titlu. Alege altul.
            </p>
          ) : null}
          {error ? (
            <p className="ts-qc-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="ts-qc-submit">
            <button
              type="submit"
              className="ts-qc-primary"
              disabled={!canSubmit}
            >
              {selected.actionLabel}
              <ArrowRight size={15} aria-hidden />
            </button>
            <span className="ts-qc-note">
              Se creează un proiect nou și se deschide atelierul.
            </span>
          </div>

          {selected.altPath && selected.altLabel ? (
            <p className="ts-qc-alt">
              {selected.altLabel}{" "}
              <Link to={selected.altPath} className="ts-block-link">
                Deschide conversația
                <ArrowRight size={14} aria-hidden />
              </Link>
            </p>
          ) : null}
        </form>
      ) : (
        <p className="ts-qc-hint">
          Alege un tip de material pentru a continua.
        </p>
      )}
    </div>
  );
}
