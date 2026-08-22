import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ThemeToggle } from "../../../theme";
import { useTeacherStudio } from "../context/TeacherStudioContext";

export function StudioSettingsPage() {
  const { teacher, assistantOpen, setAssistantOpen, contextSnapshot } =
    useTeacherStudio();
  const { signOut } = useAuth();
  const navigate = useNavigate();

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
              {teacher.email ?? teacher.schoolName ?? "Contul tău"}
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

      <section className="ts-section ts-list" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="ts-section-title">
          Aspect
        </h2>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">Luminos sau întunecat</div>
            <div className="ts-row-meta">
              Aceeași identitate LudicON, ziua sau seara. Preferința rămâne după
              reîmprospătare.
            </div>
          </div>
        </div>
        <ThemeToggle variant="panel" />
      </section>

      <section className="ts-section ts-list" aria-labelledby="session-heading">
        <h2 id="session-heading" className="ts-section-title">
          Sesiune
        </h2>
        <div className="ts-row">
          <div>
            <div className="ts-row-title">Delogare</div>
            <div className="ts-row-meta">
              Închide sesiunea. Proiectele rămân pe acest dispozitiv.
            </div>
          </div>
          <button
            type="button"
            className="ts-icon-btn"
            onClick={() => {
              void signOut().then(() => navigate("/welcome", { replace: true }));
            }}
          >
            Delogare
          </button>
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
