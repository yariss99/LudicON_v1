import { useHotkey } from "@tanstack/react-hotkeys";

/**
 * The shell's only keyboard shortcut.
 *
 * Per-destination keys were removed deliberately. Bare single letters fire
 * while a teacher is typing a lesson title, and guarding that across inputs,
 * textareas and contenteditable is fiddly enough to be a standing source of
 * bugs. The command palette already gives fast keyboard access to every
 * destination, so one binding opens it and nothing else competes.
 *
 * `ignoreInputs: false` is intentional: ⌘K carries a modifier, so it cannot be
 * typed by accident, and a teacher mid-sentence should still be able to jump.
 */
export function usePaletteHotkey(onTogglePalette: () => void): void {
  useHotkey("Mod+K", onTogglePalette, { ignoreInputs: false });
}
