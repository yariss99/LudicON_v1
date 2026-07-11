import DashboardCard from "../components/DashboardCard";
import {
  Gamepad2,
  FolderOpen,
  Library,
  Bot,
  Settings,
  CircleHelp,
} from "lucide-react";

function Dashboard() {
  return (
    <main className="app">
      <section className="hero">
        <p className="brand">CRED ÎN EDUCAȚIE</p>

        <h1>LudicON</h1>

        <p className="subtitle">
          Platforma românească pentru crearea jocurilor educaționale
        </p>

        <div className="dashboard-grid">
          <DashboardCard
            Icon={Gamepad2}
            title="Creează joc"
            to="/create"
          />

          <DashboardCard
            Icon={FolderOpen}
            title="Proiectele mele"
            to="/projects"
          />

          <DashboardCard
            Icon={Library}
            title="Biblioteca"
            to="/library"
          />

          <DashboardCard
            Icon={Bot}
            title="AI Assistant"
            to="/assistant"
          />

          <DashboardCard
            Icon={Settings}
            title="Setări"
            to="/settings"
          />

          <DashboardCard
            Icon={CircleHelp}
            title="Ajutor"
            to="/help"
          />
        </div>
      </section>
    </main>
  );
}

export default Dashboard;