import Button from "./Button";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className={
              tone === "danger"
                ? "!rounded-xl !bg-rose-600 !from-rose-600 !via-rose-600 !to-rose-700 !shadow-rose-200/50 hover:!shadow-rose-200/60"
                : "!rounded-xl"
            }
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Această acțiune afectează spațiul lecției.
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
