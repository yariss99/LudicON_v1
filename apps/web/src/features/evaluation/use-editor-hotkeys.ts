import { useHotkey } from "@tanstack/react-hotkeys";

import { redoEdit, undoEdit, type EditorStore } from "./editor-store";

/**
 * ⌘Z and ⌘⇧Z, the two shortcuts an authoring surface owes its user.
 *
 * `Mod` rather than `Meta` or `Ctrl`: the library resolves it per platform, so
 * one registration serves the teacher on a Mac and the teacher on the school's
 * Windows machine. Writing both by hand was the alternative and it is how a
 * shortcut ends up working on the machine the developer owns.
 *
 * `ignoreInputs` is left at its default, so neither fires while the teacher is
 * typing inside the inline text field. That is deliberate and it is the
 * opposite of what the shell does for ⌘K: the browser's own undo inside a text
 * field is the right behaviour for a half-typed sentence, and hijacking it
 * would take back the whole block instead of the last word.
 *
 * Nothing here is `preventDefault`ed beyond what the library does, because
 * outside an input there is no browser undo to compete with.
 */
export function useEditorHotkeys(store: EditorStore): void {
  useHotkey("Mod+Z", () => undoEdit(store));
  useHotkey("Mod+Shift+Z", () => redoEdit(store));
}
