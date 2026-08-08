import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { useExperienceMode } from "../../experience-mode";
import { LESSON_STATUSES, statusLabel } from "../constants";
import { openLessonPath } from "../LessonStudioPage";
import {
  createLessonInStudio,
  lessonStudioRepository,
} from "../services/lessonStudioRepository";
import type {
  LessonSortOption,
  LessonStudioDocument,
  LessonStudioStatus,
  LessonViewMode,
} from "../types";
import "../styles/lesson-studio.css";

type LessonsLibraryProps = {
  projectId: string;
  projectSubject?: string;
  projectGrade?: string;
};

function sortLessons(
  lessons: LessonStudioDocument[],
  sort: LessonSortOption,
): LessonStudioDocument[] {
  const next = [...lessons];
  if (sort === "alpha") {
    next.sort((a, b) =>
      a.properties.title.localeCompare(b.properties.title, "en"),
    );
  } else if (sort === "created") {
    next.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } else if (sort === "status") {
    next.sort((a, b) => a.status.localeCompare(b.status));
  } else {
    next.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }
  return next;
}

export function LessonsLibrary({
  projectId,
  projectSubject = "",
  projectGrade = "",
}: LessonsLibraryProps) {
  const navigate = useNavigate();
  const { preference } = useExperienceMode();
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<LessonSortOption>("updated");
  const [view, setView] = useState<LessonViewMode>("grid");

  const lessons = useMemo(
    () => lessonStudioRepository.listByProject(projectId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, tick],
  );

  const subjects = useMemo(() => {
    const set = new Set(
      lessons.map((l) => l.properties.subject).filter(Boolean),
    );
    return [...set].sort();
  }, [lessons]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = lessons.filter((lesson) => {
      if (status && lesson.status !== status) return false;
      if (subject && lesson.properties.subject !== subject) return false;
      if (!q) return true;
      const hay = [
        lesson.properties.title,
        lesson.properties.subject,
        lesson.properties.grade,
        lesson.properties.teachingUnit,
        ...lesson.properties.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    return sortLessons(filtered, sort);
  }, [lessons, query, status, subject, sort]);

  const reload = () => setTick((t) => t + 1);

  const openLesson = (lesson: LessonStudioDocument) => {
    navigate(
      openLessonPath(
        projectId,
        lesson.id,
        preference.mode,
        lesson.guidedCompleted,
      ),
    );
  };

  const createLesson = () => {
    const lesson = createLessonInStudio(projectId, {
      subject: projectSubject,
      grade: projectGrade,
      title: "Untitled lesson",
    });
    openLesson(lesson);
  };

  return (
    <div className="ls-library lesson-studio" style={{ background: "transparent", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Lesson Library
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            {preference.mode === "guided"
              ? "Guided mode — new lessons open as a step-by-step wizard."
              : "Advanced mode — open Lesson Studio directly."}
          </p>
        </div>
        <button
          type="button"
          className="ls-btn ls-btn-primary"
          style={{ minHeight: 38 }}
          onClick={createLesson}
        >
          New Lesson
        </button>
      </div>

      {lessons.length > 0 ? (
        <div className="ls-lib-toolbar">
          <label className="ls-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons…"
              aria-label="Search lessons"
            />
          </label>
          <select
            className="ls-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">Status</option>
            {LESSON_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            className="ls-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="ls-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as LessonSortOption)}
            aria-label="Sort lessons"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="alpha">Alphabetical</option>
            <option value="status">Status</option>
          </select>
          <select
            className="ls-select"
            value={view}
            onChange={(e) => setView(e.target.value as LessonViewMode)}
            aria-label="View mode"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
        </div>
      ) : null}

      {lessons.length === 0 ? (
        <div className="ls-empty">
          <div className="ls-empty-art" aria-hidden="true" />
          <h2>Create your first lesson</h2>
          <p>
            Lesson Studio is a creative workspace — sections, properties, and
            context in one place.
          </p>
          <button
            type="button"
            className="ls-btn ls-btn-primary"
            style={{ minHeight: 40, paddingInline: "1.1rem" }}
            onClick={createLesson}
          >
            Create your first lesson
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="ls-empty">
          <div className="ls-empty-art" aria-hidden="true" />
          <h2>No matching lessons</h2>
          <p>Try clearing search or filters.</p>
          <button
            type="button"
            className="ls-btn"
            onClick={() => {
              setQuery("");
              setStatus("");
              setSubject("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={view === "grid" ? "ls-grid" : "ls-list"}>
          {visible.map((lesson) => (
            <LessonLibraryCard
              key={lesson.id}
              lesson={lesson}
              view={view}
              href={openLessonPath(
                projectId,
                lesson.id,
                preference.mode,
                lesson.guidedCompleted,
              )}
              onDuplicate={() => {
                const copy = lessonStudioRepository.duplicate(lesson.id);
                reload();
                openLesson(copy);
              }}
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete “${lesson.properties.title}”? This cannot be undone.`,
                  )
                ) {
                  lessonStudioRepository.delete(lesson.id);
                  reload();
                }
              }}
              onStatus={(next) => {
                lessonStudioRepository.save(
                  { ...lesson, status: next },
                  { note: `Status → ${next}` },
                );
                reload();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonLibraryCard({
  lesson,
  view,
  href,
  onDuplicate,
  onDelete,
  onStatus,
}: {
  lesson: LessonStudioDocument;
  view: LessonViewMode;
  href: string;
  onDuplicate: () => void;
  onDelete: () => void;
  onStatus: (status: LessonStudioStatus) => void;
}) {
  return (
    <article
      className="ls-card"
      style={
        view === "list"
          ? { flexDirection: "row", alignItems: "center" }
          : undefined
      }
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <h3 className="ls-card-title">{lesson.properties.title}</h3>
          <span className={`ls-badge ls-badge-${lesson.status}`}>
            {statusLabel(lesson.status)}
          </span>
        </div>
        <div className="ls-card-meta">
          {[lesson.properties.grade, lesson.properties.subject]
            .filter(Boolean)
            .join(" · ") || "No class / subject"}
        </div>
        <div className="ls-card-meta">
          Updated {formatRelativeTime(lesson.updatedAt)} · v{lesson.version} ·{" "}
          {lesson.blocks.length} block{lesson.blocks.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="ls-card-actions">
        <Link className="ls-btn ls-btn-primary" to={href}>
          Open
        </Link>
        <button type="button" className="ls-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button
          type="button"
          className="ls-btn"
          onClick={() =>
            onStatus(
              lesson.status === "published" ? "in_progress" : "published",
            )
          }
        >
          {lesson.status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          className="ls-btn ls-btn-danger"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default LessonsLibrary;
