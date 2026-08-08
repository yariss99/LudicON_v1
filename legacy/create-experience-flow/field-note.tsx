import { CircleAlert } from "lucide-react";

export interface FieldNoteProps {
  id: string;
  children: string;
}

/**
 * One line under a field, when something still needs saying.
 *
 * Amber, not red: nothing has failed and nothing has been lost — the teacher
 * simply has not said this part yet. Meaning is carried by three channels at
 * once (the tint, the icon and the words), and the words themselves stay in
 * ink so they clear 4.5:1; amber at its mandated weight does not.
 */
export function FieldNote({ id, children }: FieldNoteProps) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-2 rounded-sm bg-accent-soft px-3 py-2 text-[0.9375rem] leading-[1.5] text-foreground ring-1 ring-accent/30"
    >
      <CircleAlert
        aria-hidden
        strokeWidth={1.75}
        className="mt-[0.15rem] size-4 shrink-0 text-accent"
      />
      <span>{children}</span>
    </p>
  );
}
