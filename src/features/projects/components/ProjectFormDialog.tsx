import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Input, Modal, Select, Textarea } from "../../../components/ui";
import type {
  Project,
  ProjectColorId,
  ProjectFormErrors,
  ProjectFormInput,
  ProjectIconId,
} from "../../../types/project";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
  PROJECT_GRADES,
  PROJECT_SUBJECTS,
  getProjectColor,
} from "../constants";
import ColorPicker from "./ColorPicker";
import IconPicker from "./IconPicker";

type ProjectFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialProject?: Project | null;
  isTitleTaken: (title: string, excludeId?: string) => boolean;
  onClose: () => void;
  onSubmit: (input: ProjectFormInput) => void;
};

type FormState = {
  title: string;
  subject: string;
  grade: string;
  description: string;
  color: ProjectColorId;
  icon: ProjectIconId;
  favorite: boolean;
};

const emptyForm: FormState = {
  title: "",
  subject: "",
  grade: "",
  description: "",
  color: DEFAULT_PROJECT_COLOR,
  icon: DEFAULT_PROJECT_ICON,
  favorite: false,
};

function toFormState(project?: Project | null): FormState {
  if (!project) return emptyForm;
  return {
    title: project.title,
    subject: project.subject,
    grade: project.grade,
    description: project.description,
    color: project.color,
    icon: project.icon,
    favorite: project.favorite,
  };
}

function validate(
  form: FormState,
  isTitleTaken: (title: string, excludeId?: string) => boolean,
  excludeId?: string,
): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  if (!form.title.trim()) {
    errors.title = "Titlul lecției este necesar.";
  } else if (isTitleTaken(form.title, excludeId)) {
    errors.title = "Există deja o lecție cu acest titlu.";
  }
  if (!form.subject.trim()) errors.subject = "Alege disciplina.";
  if (!form.grade.trim()) errors.grade = "Alege clasa.";
  return errors;
}

function ProjectFormDialog({
  open,
  mode,
  initialProject,
  isTitleTaken,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(initialProject));
    setErrors({});
    setSubmitted(false);
  }, [open, initialProject]);

  const accent = useMemo(
    () => getProjectColor(form.color).swatch,
    [form.color],
  );

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (submitted) {
        setErrors(validate(next, isTitleTaken, initialProject?.id));
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(form, isTitleTaken, initialProject?.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: form.title.trim(),
      subject: form.subject,
      grade: form.grade,
      description: form.description.trim(),
      color: form.color,
      icon: form.icon,
      favorite: form.favorite,
    });
    onClose();
  };

  const formId =
    mode === "create" ? "create-project-form" : "edit-project-form";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Creează o lecție" : "Editează lecția"}
      description={
        mode === "create"
          ? "Pornește o lecție pentru obiective, activități, evaluare și materiale."
          : "Actualizează detaliile acestei lecții."
      }
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={onClose}
          >
            Anulează
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            className="!rounded-xl"
          >
            {mode === "create" ? "Creează o lecție" : "Salvează"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="Titlu"
          name="title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="ex. Fracții — lecție introductivă"
          required
          error={errors.title}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Disciplină"
            name="subject"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            options={PROJECT_SUBJECTS}
            placeholder="Alege disciplina"
            required
            error={errors.subject}
          />
          <Select
            label="Clasă"
            name="grade"
            value={form.grade}
            onChange={(event) => updateField("grade", event.target.value)}
            options={PROJECT_GRADES}
            placeholder="Alege clasa"
            required
            error={errors.grade}
          />
        </div>

        <Textarea
          label="Descriere"
          name="description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Ce intenție didactică ghidează această lecție?"
          hint="Opțional — te ajută să găsești mai ușor proiectul lecției mai târziu."
        />

        <ColorPicker
          value={form.color}
          onChange={(color) => updateField("color", color)}
        />

        <IconPicker
          value={form.icon}
          onChange={(icon) => updateField("icon", icon)}
          accentColor={accent}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
          <input
            type="checkbox"
            checked={form.favorite}
            onChange={(event) => updateField("favorite", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Marchează ca favorită</span>
        </label>
      </form>
    </Modal>
  );
}

export default ProjectFormDialog;
