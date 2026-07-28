import type { ProjectResource } from "../../../types/project";
import ResourceCard from "./ResourceCard";

type WorkspaceGridProps = {
  projectId: string;
  resources: readonly ProjectResource[];
  onOpenResource: (resource: ProjectResource) => void;
};

function WorkspaceGrid({
  projectId,
  resources,
  onOpenResource,
}: WorkspaceGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource, index) => (
        <div key={resource.id} style={{ animationDelay: `${80 + index * 60}ms` }}>
          <ResourceCard
            projectId={projectId}
            resource={resource}
            onOpen={onOpenResource}
          />
        </div>
      ))}
    </div>
  );
}

export default WorkspaceGrid;
