import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import {
  ASSET_TYPES,
  ASSET_TYPE_LABEL,
  DIFFICULTIES,
  SHARE_SCOPES,
} from "../constants";
import { useResourceCenter } from "../hooks/useResourceCenter";
import type {
  ResourceAssetType,
  ResourceSharePermission,
  ResourceShareScope,
} from "../types";
import { KnowledgeGraphViewer } from "./KnowledgeGraphViewer";
import { ResourceCard } from "./ResourceCard";

function StringListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: readonly string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <label className="rc-field">
      {label}
      <textarea
        className="rc-textarea"
        value={items.join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        placeholder="Câte un element pe linie"
      />
    </label>
  );
}

export function ResourceMainPane() {
  const {
    sectionId,
    filteredHits,
    filters,
    setFilters,
    selected,
    selectResource,
    saveResource,
    setShare,
    toggleFavorite,
    duplicate,
    archive,
    versions,
    restoreVersion,
    branch,
    merge,
    analytics,
    runAi,
    recordReuse,
    createUpload,
  } = useResourceCenter();

  if (sectionId === "browse" || sectionId === "search") {
    return (
      <section>
        <h2 className="rc-section-title">
          {sectionId === "search" ? "Căutare avansată" : "Browse knowledge"}
        </h2>
        <p className="rc-lead">
          Caută după cuvinte cheie, competențe, obiective, tip, clasă — sau
          activează similaritate semantică / limbaj natural.
        </p>
        <div className="rc-filters">
          <label className="rc-field">
            Interogare
            <input
              className="rc-input"
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="ex: fracții clasa a III-a evaluare"
            />
          </label>
          <label className="rc-field">
            Tip asset
            <select
              className="rc-select"
              value={filters.assetTypes[0] ?? ""}
              onChange={(e) =>
                setFilters({
                  assetTypes: e.target.value
                    ? [e.target.value as ResourceAssetType]
                    : [],
                })
              }
            >
              <option value="">Toate</option>
              {ASSET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-field">
            Disciplină
            <input
              className="rc-input"
              value={filters.subjects[0] ?? ""}
              onChange={(e) =>
                setFilters({
                  subjects: e.target.value ? [e.target.value] : [],
                })
              }
            />
          </label>
          <label className="rc-field">
            Clasă
            <input
              className="rc-input"
              value={filters.grades[0] ?? ""}
              onChange={(e) =>
                setFilters({
                  grades: e.target.value ? [e.target.value] : [],
                })
              }
            />
          </label>
          <label className="rc-field">
            Competență
            <input
              className="rc-input"
              value={filters.competency ?? ""}
              onChange={(e) => setFilters({ competency: e.target.value })}
            />
          </label>
          <label className="rc-field">
            Obiectiv
            <input
              className="rc-input"
              value={filters.objective ?? ""}
              onChange={(e) => setFilters({ objective: e.target.value })}
            />
          </label>
          <label className="rc-field">
            Autor
            <input
              className="rc-input"
              value={filters.author ?? ""}
              onChange={(e) => setFilters({ author: e.target.value })}
            />
          </label>
          <label className="rc-field">
            Dificultate
            <select
              className="rc-select"
              value={filters.difficulty ?? ""}
              onChange={(e) =>
                setFilters({
                  difficulty: (e.target.value || undefined) as
                    | "easy"
                    | "medium"
                    | "hard"
                    | undefined,
                })
              }
            >
              <option value="">Oricare</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-field">
            Scope partajare
            <select
              className="rc-select"
              value={filters.shareScope ?? ""}
              onChange={(e) =>
                setFilters({
                  shareScope: (e.target.value ||
                    undefined) as ResourceShareScope | undefined,
                })
              }
            >
              <option value="">Toate</option>
              {SHARE_SCOPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="rc-actions" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={["rc-btn", filters.semantic ? "rc-btn-primary" : ""].join(
              " ",
            )}
            onClick={() => setFilters({ semantic: !filters.semantic })}
          >
            Semantic search
          </button>
          <button
            type="button"
            className={[
              "rc-btn",
              filters.naturalLanguage ? "rc-btn-primary" : "",
            ].join(" ")}
            onClick={() =>
              setFilters({ naturalLanguage: !filters.naturalLanguage })
            }
          >
            Natural language
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => runAi("suggest_existing")}
          >
            Sugerează existente
          </button>
        </div>
        {filteredHits.length === 0 ? (
          <div className="rc-empty">
            Nicio resursă. Reindexează sau adaugă un upload.
          </div>
        ) : (
          <div className="rc-cards">
            {filteredHits.map((hit) => (
              <ResourceCard
                key={hit.resource.id}
                resource={hit.resource}
                active={selected?.id === hit.resource.id}
                score={hit.score}
                reasons={hit.reasons}
                onSelect={() => selectResource(hit.resource.id)}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (sectionId === "graph") {
    return (
      <section>
        <h2 className="rc-section-title">Knowledge Graph</h2>
        <p className="rc-lead">
          Relații între proiecte, lecții, fișe, evaluări, povești, jocuri,
          prezentări, competențe și profesori.
        </p>
        <KnowledgeGraphViewer />
      </section>
    );
  }

  if (sectionId === "detail" || sectionId === "metadata") {
    if (!selected) {
      return (
        <section>
          <h2 className="rc-section-title">Asset Viewer</h2>
          <div className="rc-empty">Selectează o resursă din Browse.</div>
        </section>
      );
    }
    return (
      <section>
        <h2 className="rc-section-title">
          {sectionId === "metadata" ? "Editor metadate" : "Asset Viewer"}
        </h2>
        <p className="rc-lead">
          {ASSET_TYPE_LABEL[selected.assetType]} · {selected.projectTitle ?? "—"}{" "}
          · validare {selected.validationStatus}
        </p>
        <div className="rc-actions" style={{ marginBottom: "1rem" }}>
          {selected.sourceHref ? (
            <Link className="rc-btn rc-btn-primary" to={selected.sourceHref}>
              Deschide în builder
            </Link>
          ) : null}
          <button
            type="button"
            className="rc-btn"
            onClick={() => toggleFavorite(selected.id)}
          >
            {selected.favorite ? "★ Favorit" : "☆ Favorit"}
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => {
              duplicate(selected.id);
              recordReuse(selected.id);
            }}
          >
            Reutilizează / duplică
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => runAi("recommend_similar")}
          >
            Similare
          </button>
          <button
            type="button"
            className="rc-btn rc-btn-danger"
            onClick={() => {
              if (window.confirm("Arhivezi resursa?")) archive(selected.id);
            }}
          >
            Arhivează
          </button>
        </div>

        <div className="rc-card">
          <div className="rc-kicker">Preview conținut</div>
          <pre className="rc-pre">
            {selected.contentPreview ||
              selected.ai.summary ||
              selected.description ||
              "Fără preview"}
          </pre>
        </div>

        <div className="rc-grid-2">
          <label className="rc-field">
            Nume
            <input
              className="rc-input"
              value={selected.name}
              onChange={(e) =>
                saveResource({ ...selected, name: e.target.value })
              }
            />
          </label>
          <label className="rc-field">
            Tip
            <select
              className="rc-select"
              value={selected.assetType}
              onChange={(e) =>
                saveResource({
                  ...selected,
                  assetType: e.target.value as ResourceAssetType,
                })
              }
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-field">
            Disciplină
            <input
              className="rc-input"
              value={selected.subject}
              onChange={(e) =>
                saveResource({ ...selected, subject: e.target.value })
              }
            />
          </label>
          <label className="rc-field">
            Clasă
            <input
              className="rc-input"
              value={selected.grade}
              onChange={(e) =>
                saveResource({ ...selected, grade: e.target.value })
              }
            />
          </label>
          <label className="rc-field">
            Limbă
            <input
              className="rc-input"
              value={selected.language}
              onChange={(e) =>
                saveResource({ ...selected, language: e.target.value })
              }
            />
          </label>
          <label className="rc-field">
            Minute estimate
            <input
              className="rc-input"
              type="number"
              value={selected.estimatedMinutes ?? ""}
              onChange={(e) =>
                saveResource({
                  ...selected,
                  estimatedMinutes: Number(e.target.value) || undefined,
                })
              }
            />
          </label>
        </div>
        <label className="rc-field">
          Descriere
          <textarea
            className="rc-textarea"
            value={selected.description}
            onChange={(e) =>
              saveResource({ ...selected, description: e.target.value })
            }
          />
        </label>
        <StringListField
          label="Tag-uri"
          items={selected.tags}
          onChange={(tags) => saveResource({ ...selected, tags })}
        />
        <StringListField
          label="Competențe"
          items={selected.competencies}
          onChange={(competencies) =>
            saveResource({ ...selected, competencies })
          }
        />
        <StringListField
          label="Obiective de învățare"
          items={selected.learningObjectives}
          onChange={(learningObjectives) =>
            saveResource({ ...selected, learningObjectives })
          }
        />
        <StringListField
          label="Referințe curriculare"
          items={selected.curriculumRefs}
          onChange={(curriculumRefs) =>
            saveResource({ ...selected, curriculumRefs })
          }
        />
        <div className="rc-actions">
          <button
            type="button"
            className="rc-btn rc-btn-primary"
            onClick={() => runAi("generate_metadata")}
          >
            Generează metadate AI
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => runAi("auto_summarize")}
          >
            Rezumă
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => runAi("extract_keywords")}
          >
            Keywords
          </button>
        </div>
      </section>
    );
  }

  if (sectionId === "sharing") {
    if (!selected) {
      return (
        <section>
          <h2 className="rc-section-title">Partajare</h2>
          <div className="rc-empty">Selectează o resursă.</div>
        </section>
      );
    }
    return (
      <section>
        <h2 className="rc-section-title">Sistem de partajare</h2>
        <p className="rc-lead">
          Personal · Școală · District · Public · Team — cu read-only,
          colaborativ sau aprobare.
        </p>
        <div className="rc-card">
          <strong>{selected.name}</strong>
          <div className="rc-kicker">
            Scope: {selected.shareScope} · {selected.sharePermission} · aprobare{" "}
            {selected.approvalState}
          </div>
        </div>
        <div className="rc-grid-2">
          <label className="rc-field">
            Bibliotecă
            <select
              className="rc-select"
              value={selected.shareScope}
              onChange={(e) =>
                setShare(
                  selected.id,
                  e.target.value as ResourceShareScope,
                  selected.sharePermission,
                )
              }
            >
              {SHARE_SCOPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-field">
            Permisiune
            <select
              className="rc-select"
              value={selected.sharePermission}
              onChange={(e) =>
                setShare(
                  selected.id,
                  selected.shareScope,
                  e.target.value as ResourceSharePermission,
                )
              }
            >
              <option value="read_only">Read only</option>
              <option value="collaborative">Collaborative editing</option>
              <option value="approval_required">Approval workflow</option>
            </select>
          </label>
        </div>
      </section>
    );
  }

  if (sectionId === "versions") {
    if (!selected) {
      return (
        <section>
          <h2 className="rc-section-title">Versiuni</h2>
          <div className="rc-empty">Selectează o resursă.</div>
        </section>
      );
    }
    return (
      <section>
        <h2 className="rc-section-title">Version management</h2>
        <p className="rc-lead">
          Istoric, restore, compare, merge, branch, archive.
        </p>
        <div className="rc-actions" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className="rc-btn"
            onClick={() => {
              const name = window.prompt("Nume branch", "variantă");
              if (name) branch(selected.id, name);
            }}
          >
            Branch
          </button>
          <button
            type="button"
            className="rc-btn"
            onClick={() => {
              const other = window.prompt(
                "ID resursă sursă de merge (va fi arhivată)",
              );
              if (other) merge(other, selected.id);
            }}
          >
            Merge into current
          </button>
        </div>
        {versions.slice(0, 30).map((v, i) => (
          <div key={v.id} className="rc-card">
            <div className="rc-card-head">
              <strong>
                v{v.version} · {v.note}
              </strong>
              <span className="rc-chip">{v.actor}</span>
            </div>
            <div className="rc-kicker">
              {formatRelativeTime(v.createdAt)} · {v.snapshot.name}
            </div>
            <div className="rc-actions" style={{ marginTop: "0.45rem" }}>
              <button
                type="button"
                className="rc-btn rc-btn-primary"
                onClick={() => restoreVersion(v.id)}
              >
                Restaurează
              </button>
              {versions[i + 1] ? (
                <span className="rc-chip">
                  vs v{versions[i + 1]!.version}:{" "}
                  {v.snapshot.name === versions[i + 1]!.snapshot.name
                    ? "același titlu"
                    : "titlu diferit"}
                  , {v.snapshot.tags.length} vs{" "}
                  {versions[i + 1]!.snapshot.tags.length} tag-uri
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (sectionId === "analytics") {
    return (
      <section>
        <h2 className="rc-section-title">Analytics</h2>
        <p className="rc-lead">
          Utilizare, eficiență, activitate profesori, acoperire curriculară,
          reuse.
        </p>
        <div className="rc-grid-2">
          <div className="rc-card">
            <div className="rc-kicker">Total reuse</div>
            <div className="rc-stat">{analytics.reuseStats.totalReuses}</div>
          </div>
          <div className="rc-card">
            <div className="rc-kicker">Medie reuse / asset</div>
            <div className="rc-stat">
              {analytics.reuseStats.avgReusePerAsset}
            </div>
          </div>
          <div className="rc-card">
            <div className="rc-kicker">Partajate</div>
            <div className="rc-stat">{analytics.reuseStats.sharedCount}</div>
          </div>
        </div>
        {(
          [
            ["Most used", analytics.mostUsed],
            ["Most effective", analytics.mostEffective],
            ["Recently created", analytics.recentlyCreated],
            ["Recently updated", analytics.recentlyUpdated],
            ["Unused", analytics.unused],
          ] as const
        ).map(([title, list]) => (
          <div key={title} style={{ marginTop: "1rem" }}>
            <h3 className="rc-section-title" style={{ fontSize: "1.05rem" }}>
              {title}
            </h3>
            <div className="rc-cards">
              {list.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onSelect={() => selectResource(r.id)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="rc-card" style={{ marginTop: "1rem" }}>
          <strong>Curriculum coverage</strong>
          {analytics.curriculumCoverage.length === 0 ? (
            <div className="rc-kicker">Nicio referință încă.</div>
          ) : (
            analytics.curriculumCoverage.map((c) => (
              <div key={c.ref} className="rc-kicker">
                {c.ref}: {c.count}
              </div>
            ))
          )}
        </div>
        <div className="rc-card">
          <strong>Teacher activity</strong>
          {analytics.teacherActivity.map((t) => (
            <div key={t.author} className="rc-kicker">
              {t.author}: {t.count}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (sectionId === "ai") {
    return (
      <section>
        <h2 className="rc-section-title">AI Knowledge</h2>
        <p className="rc-lead">
          Sugestii, similaritate, lipsuri, reuse, merge, metadate, acoperire.
        </p>
        <div className="rc-actions" style={{ marginBottom: "1rem" }}>
          {(
            [
              "suggest_existing",
              "recommend_similar",
              "detect_missing",
              "suggest_reuse",
              "merge_similar",
              "recommend_improvements",
              "identify_curriculum_coverage",
            ] as const
          ).map((action) => (
            <button
              key={action}
              type="button"
              className="rc-btn"
              onClick={() => runAi(action)}
            >
              {action.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="rc-btn"
          onClick={() =>
            createUpload({
              name: "Resursă AI generată",
              assetType: "ai_generated",
              description: "Creată din Resource Center AI",
            })
          }
        >
          Adaugă AI generated stub
        </button>
      </section>
    );
  }

  if (sectionId === "coverage") {
    return (
      <section>
        <h2 className="rc-section-title">Acoperire curriculară</h2>
        <p className="rc-lead">
          Hartă a referințelor curriculare pe resursele indexate.
        </p>
        <button
          type="button"
          className="rc-btn rc-btn-primary"
          onClick={() => runAi("identify_curriculum_coverage")}
        >
          Analizează acoperirea
        </button>
        <div className="rc-card" style={{ marginTop: "1rem" }}>
          {analytics.curriculumCoverage.length === 0 ? (
            <div className="rc-empty">Rulează analiza sau adaugă referințe.</div>
          ) : (
            analytics.curriculumCoverage.map((c) => (
              <div key={c.ref} className="rc-card">
                <strong>{c.ref}</strong>
                <div className="rc-kicker">{c.count} resurse</div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  return null;
}
