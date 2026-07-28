import { Link } from "react-router-dom";
import {
  useStudioNotificationsData,
  useTeacherStudio,
} from "../context/TeacherStudioContext";

export function StudioNotificationsPage() {
  const { items } = useStudioNotificationsData();
  const { markNotificationRead, markAllNotificationsRead } = useTeacherStudio();

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="ts-page-title">Notificări</h1>
          <p className="ts-page-lead">
            Alerte utile — fără zgomot. PRIMA sugerează, tu confirmi.
          </p>
        </div>
        <button
          type="button"
          className="ts-icon-btn"
          onClick={markAllNotificationsRead}
        >
          Marchează citite
        </button>
      </header>

      <div className="ts-section ts-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="ts-row"
            style={{ opacity: item.read ? 0.72 : 1 }}
          >
            <div className="min-w-0 flex-1">
              <div className="ts-row-title">{item.title}</div>
              <div className="ts-row-meta">{item.body}</div>
            </div>
            <div className="flex gap-2">
              {!item.read ? (
                <button
                  type="button"
                  className="ts-icon-btn"
                  onClick={() => markNotificationRead(item.id)}
                >
                  Citește
                </button>
              ) : (
                <span className="ts-chip">Citit</span>
              )}
              {item.href ? (
                <Link className="ts-icon-btn" to={item.href}>
                  Deschide
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
