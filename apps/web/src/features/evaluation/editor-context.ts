import { createStoreContext, useSelector } from "@tanstack/react-store";

import type { EditorState, EditorStore } from "./editor-store";

/**
 * How the builder's parts reach the one store the route created.
 *
 * `createStoreContext` transports the store instance and nothing else, so the
 * context value is stable for the lifetime of the screen and no consumer
 * re-renders because a sibling edited a heading. That is the whole reason the
 * store is not simply passed down as a prop: the toolbar, the rail, the canvas
 * and the inspector are four levels apart, and threading it would put a
 * `store` prop on every component in between whether it read from it or not.
 *
 * Prop drilling was still the alternative considered, and it is rejected only
 * because of that middle layer — not for ceremony. Anything that genuinely
 * takes one value should keep taking it as a prop.
 */
const { StoreProvider, useStoreContext } = createStoreContext<{
  editor: EditorStore;
}>();

export const EditorStoreProvider = StoreProvider;

export const useEditorStore = (): EditorStore => useStoreContext().editor;

/**
 * Subscribes to one slice of the editor.
 *
 * Every read goes through a selector rather than taking the whole state,
 * because the document object identity changes on every command: a component
 * that selected the whole state would re-render on a keystroke in a block it
 * does not show.
 */
export function useEditor<TSelected>(
  selector: (state: EditorState) => TSelected,
): TSelected {
  return useSelector(useStoreContext().editor, selector);
}
