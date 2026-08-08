import "../styles/projects.css";

type DeleteConfirmationProps = {
  open: boolean;
  projectTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmation({
  open,
  projectTitle,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {
  if (!open) return null;

  return (
    <div
      className="pm-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="pm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pm-delete-title"
      >
        <h2 id="pm-delete-title">Delete project</h2>
        <p className="pm-modal-lead">
          Delete <strong>{projectTitle}</strong>? This removes the project and
          its mock assets from local data. This cannot be undone.
        </p>
        <div className="pm-modal-actions">
          <button type="button" className="pm-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pm-btn-primary"
            style={{ background: "#b91c1c" }}
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;
