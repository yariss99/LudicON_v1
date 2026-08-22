import {
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  NotebookPen,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { useStudioActivityData } from "../context/TeacherStudioContext";
import type { ActivityItem, ActivityKind } from "../types";

const LABELS: Record<ActivityKind, string> = {
  opened: "Deschis recent",
  edited: "Editat",
  ai_generated: "Generat de PRIMA",
  teacher_modified: "Modificat de tine",
  published: "Publicat",
};

const ICONS: Record<ActivityKind, typeof FolderOpen> = {
  opened: FolderOpen,
  edited: PenLine,
  ai_generated: Sparkles,
  teacher_modified: NotebookPen,
  published: CheckCircle2,
};

type JournalGroupId = "today" | "yesterday" | "earlier";

const GROUP_LABELS: Record<JournalGroupId, string> = {
  today: "Astăzi",
  yesterday: "Ieri",
  earlier: "Mai devreme",
};

const GROUP_ORDER: readonly JournalGroupId[] = ["today", "yesterday", "earlier"];

const DAY_MS = 24 * 60 * 60 * 1000;

export function StudioActivityPage() {
  const { items } = useStudioActivityData();

  const groups = useMemo(() => {
    const todayStart = startOfToday();
    const buckets = new Map<JournalGroupId, ActivityItem[]>();

    for (const item of items) {
      const id = groupFor(item, todayStart);
      const bucket = buckets.get(id);
      if (bucket) {
        bucket.push(item);
      } else {
        buckets.set(id, [item]);
      }
    }

    return GROUP_ORDER.map((id) => ({
      id,
      label: GROUP_LABELS[id],
      items: buckets.get(id) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [items]);

  return (
    <div>
      <header>
        <h1 className="ts-page-title">Activitate recentă</h1>
        <p className="ts-page-lead">
          Ce ai deschis, editat, generat sau publicat — fără zgomot inutil.
          Alege un material pentru a relua de unde ai rămas.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="ts-activity-empty">
          <h2 className="ts-activity-empty-title">
            Încă nu ai activitate recentă
          </h2>
          <p className="ts-activity-empty-text">
            Aici vei regăsi materialele la care ai lucrat în ultima vreme, ca să
            poți continua imediat. Începe un material și revino oricând.
          </p>
          <Link to="/create/experience" className="ts-icon-btn">
            <Sparkles size={15} aria-hidden />
            Creează un material
          </Link>
        </div>
      ) : (
        <>
          <div className="ts-journal">
            {groups.map((group) => (
              <section
                key={group.id}
                className="ts-journal-group"
                aria-labelledby={`journal-${group.id}`}
              >
                <div className="ts-journal-head">
                  <h2 id={`journal-${group.id}`} className="ts-journal-title">
                    {group.label}
                  </h2>
                  <span className="ts-journal-rule" aria-hidden />
                </div>

                <ol className="ts-journal-list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <ActivityEntry item={item} />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <div className="ts-journal-foot">
            <p className="ts-journal-note">
              Activitatea arată doar lucrul recent. Toate materialele rămân în
              proiecte.
            </p>
            <Link to="/projects" className="ts-journal-link">
              Vezi toate proiectele
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function ActivityEntry({ item }: { item: ActivityItem }) {
  const Icon = ICONS[item.kind];
  const parsed = Date.parse(item.timestamp);
  const hasTimestamp = !Number.isNaN(parsed);

  return (
    <Link
      to={item.projectId ? `/studio/${item.projectId}` : "/projects"}
      className={["ts-activity", item.kind === "ai_generated" ? "is-ai" : ""]
        .join(" ")
        .trim()}
    >
      <span className="ts-activity-icon" aria-hidden>
        <Icon size={18} strokeWidth={1.75} />
      </span>

      <span className="ts-activity-body">
        <span className="ts-activity-title">{item.title}</span>
        <span className="ts-activity-meta">
          <span className="ts-activity-kind">{LABELS[item.kind]}</span> ·{" "}
          {item.detail}
        </span>
      </span>

      <span className="ts-activity-aside">
        <time
          className="ts-activity-time"
          dateTime={hasTimestamp ? item.timestamp : undefined}
        >
          {hasTimestamp
            ? formatRelativeTime(item.timestamp)
            : item.timestampLabel}
        </time>
        <span className="ts-activity-go" aria-hidden>
          <ArrowRight size={15} strokeWidth={2} />
        </span>
      </span>
    </Link>
  );
}

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** Buckets on the item's real timestamp — never on a fabricated one. */
function groupFor(item: ActivityItem, todayStart: number): JournalGroupId {
  const parsed = Date.parse(item.timestamp);
  if (Number.isNaN(parsed)) return "earlier";
  if (parsed >= todayStart) return "today";
  if (parsed >= todayStart - DAY_MS) return "yesterday";
  return "earlier";
}
