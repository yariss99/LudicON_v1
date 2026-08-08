import { useState } from "react";
import {
  GRADE_LEVEL_LABEL,
  type GradeLevel,
  type Project,
  type ProjectPatch,
} from "@ludicon/domain";
import { Button, Label, Switch } from "@ludicon/ui";

import {
  ChoiceField,
  TextAreaField,
  TextField,
} from "../builder/editors/fields";
import { WORKSPACE_COPY } from "./copy";

export type SettingsTabProps = {
  project: Project;
  onSave: (patch: ProjectPatch) => void;
};

/**
 * Project settings.
 *
 * The old settings tab wrote seven metadata fields into a parallel store the
 * domain never saw. These are the project's own fields, so they save through
 * the same repository as everything else.
 */
export function SettingsTab({ project, onSave }: SettingsTabProps) {
  const [draft, setDraft] = useState<ProjectPatch>({
    title: project.title,
    description: project.description,
    subject: project.subject,
    grade: project.grade,
    favorite: project.favorite,
  });

  const set = <TKey extends keyof ProjectPatch>(
    key: TKey,
    value: ProjectPatch[TKey],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <section aria-labelledby="setari" className="max-w-2xl">
      <h2
        id="setari"
        className="font-display text-xl font-semibold text-strong"
      >
        {WORKSPACE_COPY.settingsHeading}
      </h2>
      <p className="mt-1 mb-6 text-muted-foreground">
        {WORKSPACE_COPY.settingsLead}
      </p>

      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <TextField
          label={WORKSPACE_COPY.fieldTitle}
          value={draft.title ?? ""}
          onChange={(next) => set("title", next)}
        />
        <TextAreaField
          label={WORKSPACE_COPY.fieldDescription}
          rows={4}
          value={draft.description ?? ""}
          onChange={(next) => set("description", next)}
        />
        <TextField
          label={WORKSPACE_COPY.fieldSubject}
          value={draft.subject ?? ""}
          onChange={(next) => set("subject", next)}
        />
        <ChoiceField
          label={WORKSPACE_COPY.fieldGrade}
          value={draft.grade ?? project.grade}
          options={GRADE_LEVEL_LABEL}
          onChange={(next: GradeLevel) => set("grade", next)}
        />

        <div className="flex min-h-11 items-center gap-3">
          <Switch
            id="project-favorite"
            checked={draft.favorite ?? false}
            onCheckedChange={(checked) => set("favorite", checked)}
          />
          <div>
            <Label htmlFor="project-favorite">
              {WORKSPACE_COPY.fieldFavorite}
            </Label>
            <p className="text-sm text-muted-foreground">
              {WORKSPACE_COPY.fieldFavoriteHint}
            </p>
          </div>
        </div>

        <Button type="submit" variant="primary" className="self-start">
          {WORKSPACE_COPY.save}
        </Button>
      </form>
    </section>
  );
}
