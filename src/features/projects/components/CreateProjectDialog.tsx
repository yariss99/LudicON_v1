import type { ProjectFormInput } from "../../../types/project";
import ProjectFormDialog from "./ProjectFormDialog";

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: ProjectFormInput) => void;
  isTitleTaken: (title: string, excludeId?: string) => boolean;
};

function CreateProjectDialog({
  open,
  onClose,
  onCreate,
  isTitleTaken,
}: CreateProjectDialogProps) {
  return (
    <ProjectFormDialog
      open={open}
      mode="create"
      isTitleTaken={isTitleTaken}
      onClose={onClose}
      onSubmit={onCreate}
    />
  );
}

export default CreateProjectDialog;
