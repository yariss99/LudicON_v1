import { AppShell } from "../components/layout";
import SurfaceCard from "../components/ui/SurfaceCard";
import { teacherProfile } from "../data/workspaceData";

function Profile() {
  return (
    <AppShell>
      <header className="mb-10">
        <p className="text-sm font-medium text-slate-500">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Your profile
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Simple preferences — pedagogical decisions stay with you.
        </p>
      </header>

      <SurfaceCard padding="lg" bordered className="max-w-lg">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
            {teacherProfile.initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {teacherProfile.fullName}
            </p>
            <p className="text-sm text-slate-500">{teacherProfile.role}</p>
          </div>
        </div>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-slate-400">Limbă interfață</dt>
            <dd className="mt-0.5 font-medium text-slate-800">Română</dd>
          </div>
          <div>
            <dt className="text-slate-400">Context școlar</dt>
            <dd className="mt-0.5 font-medium text-slate-800">
              Învățământ primar — România
            </dd>
          </div>
        </dl>
      </SurfaceCard>
    </AppShell>
  );
}

export default Profile;
