import { ClassroomStudioProvider } from "./hooks/useClassroomStudio";
import { ClassroomStudioShell } from "./components/ClassroomStudioShell";

export function ClassroomStudioPage({
  embedded,
  projectId,
}: {
  embedded?: boolean;
  projectId: string;
}) {
  return (
    <ClassroomStudioProvider projectId={projectId}>
      <ClassroomStudioShell embedded={embedded} />
    </ClassroomStudioProvider>
  );
}

export default ClassroomStudioPage;
