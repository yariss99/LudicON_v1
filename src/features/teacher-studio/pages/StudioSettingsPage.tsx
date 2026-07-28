import { useTeacherStudio } from "../context/TeacherStudioContext";

export function StudioSettingsPage() {
  const { teacher, assistantOpen, setAssistantOpen, contextSnapshot } =
    useTeacherStudio();

  return (
    <div>
      <header>
        <h1 className="ts-page-title">Setări</h1>
        <p className="ts-page-lead">
          Preferințe personale pentru Teacher Studio. Fără complexitate tehnică.
        </p>
      </header>

      <section className="ts-section ts-list" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="ts-section-title">
          Profil
        </h2>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">{teacher.displayName}</div>
            <div className="ts-row-meta">
              {teacher.schoolName ?? "Școală"} · {teacher.locale}
            </div>
          </div>
        </div>
      </section>

      <section className="ts-section ts-list" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="ts-section-title">
          Spațiu de lucru
        </h2>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">Panou PRIMA</div>
            <div className="ts-row-meta">
              Asistent context-aware (proiect, preferințe, stare)
            </div>
          </div>
          <button
            type="button"
            className="ts-icon-btn"
            aria-pressed={assistantOpen}
            onClick={() => setAssistantOpen(!assistantOpen)}
          >
            {assistantOpen ? "Deschis" : "Închis"}
          </button>
        </div>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">Proiect activ</div>
            <div className="ts-row-meta">
              {contextSnapshot.activeProjectTitle ?? "Niciunul"}
            </div>
          </div>
        </div>
      </section>

      <section className="ts-section ts-list" aria-labelledby="a11y-heading">
        <h2 id="a11y-heading" className="ts-section-title">
          Accesibilitate & scurtături
        </h2>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">Navigare rapidă</div>
            <div className="ts-row-meta">
              Apasă G, apoi H / P / L / A / C / N / S · [ comută PRIMA
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
