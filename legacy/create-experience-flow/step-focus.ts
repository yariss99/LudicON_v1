/**
 * Hands focus to the one control a step is actually about.
 *
 * Each step marks that control with `data-autofocus`, so a keyboard or screen
 * reader user lands on the answer rather than at the top of the page and has
 * to walk back down to it.
 */

/**
 * Puts the cursor after whatever is already written.
 *
 * The field arrives holding an opening phrase for the teacher to finish, and
 * a plain `focus()` drops the cursor in front of it — so the first thing they
 * type lands before the words they were meant to continue.
 */
function caretToEnd(target: HTMLElement): void {
  if (target instanceof HTMLTextAreaElement) {
    target.setSelectionRange(target.value.length, target.value.length);
    return;
  }
  // `setSelectionRange` throws on a radio or a checkbox, so text fields only.
  if (target instanceof HTMLInputElement && target.type === "text") {
    target.setSelectionRange(target.value.length, target.value.length);
  }
}

export function focusStepTarget(container: HTMLElement | null): void {
  const target = container?.querySelector<HTMLElement>("[data-autofocus]");
  if (!target) return;
  target.focus();
  caretToEnd(target);
}
