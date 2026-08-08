import { useState } from "react";
import type { EvaluationProject } from "@ludicon/evaluation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@ludicon/ui";

import type { RenderMode } from "../canvas/block-view";
import { CanvasDragProvider } from "../canvas/canvas-dnd";
import { EVALUATION_COPY } from "../copy";
import {
  EditorStoreProvider,
  useEditor,
  useEditorStore,
} from "../editor-context";
import { createEditorStore } from "../editor-store";
import { useAutosave } from "../use-autosave";
import { useEditorHotkeys } from "../use-editor-hotkeys";
import { BuilderToolbar } from "./builder-toolbar";
import { EditorCanvas } from "./editor-canvas";
import { InspectorPanel } from "./inspector-panel";
import { LibraryPanel } from "./library-panel";
import { PagesRail } from "./pages-rail";

/**
 * The builder: a toolbar, and three regions under it.
 *
 * The store is created ONCE, from the document the route loaded, and never
 * reseeded. A refetch that replaced it would stomp on whatever the teacher had
 * typed since — the same rule `legacy/builder/useBuilder.ts` states as "work
 * cannot be silently lost". Opening a different paper is a different mount,
 * because the route keys this component on the project id.
 *
 * The two side regions are resizable and the canvas is not given a fixed width:
 * a page at 100% is 794 CSS pixels, which does not fit beside two panels on a
 * laptop, so which of the three gives way has to be the teacher's choice rather
 * than a breakpoint's.
 *
 * The library and the inspector share the right region, stacked, rather than
 * living behind tabs. Adding a piece and then adjusting it is one motion, and
 * tabs would make the second half of it a navigation.
 *
 * ## Why the drag context is mounted here and not beside the paper
 *
 * It is the only place it can be. dnd-kit matches a draggable to a droppable
 * inside ONE `DndContext`, and a piece dragged out of the library has to reach
 * a seam measured over the canvas — two regions whose nearest common ancestor
 * is this component. With the context down beside the paper, where it started,
 * a library item was not in the same conversation as the seams and no drop
 * could ever resolve. `CanvasDragProvider` therefore wraps the whole builder,
 * and `canvas-dnd.tsx` explains how the layer over the paper registers into it
 * from three components down.
 *
 * It wraps the toolbar too, which costs nothing: a drag begins only from an
 * element that spreads the sensor's listeners, and only the library's items and
 * the boxes over the paper do.
 */

/**
 * Panel sizes in PIXELS.
 *
 * `react-resizable-panels` v4 reads a numeric `defaultSize` as pixels and a
 * unitless STRING as a percentage — the opposite of v2/v3, where every number
 * was a percentage. `defaultSize={16}` therefore produced a 16-pixel rail
 * rather than a sixth of the window, which is how this was first written and
 * what the measurement caught.
 *
 * Pixels are the right unit here anyway: a page thumbnail and an inspector
 * field have an intrinsic comfortable width, and a percentage would make both
 * unusable on a laptop and wasteful on a monitor.
 *
 * ## And the pixels have to survive a window resize
 *
 * Sizing a panel in pixels does not, by itself, make it stay that many pixels.
 * `groupResizeBehavior` defaults to `preserve-relative-size`, so v4 records
 * each panel's SHARE of the group and re-applies it: dragging the window from
 * 1024 to 1440 handed the rails 23% and 34% of 416 new pixels and the left rail
 * walked out to its 360px ceiling, while the paper — the only region with more
 * to show than it can fit — gained about half of what appeared. A fresh load at
 * 1440 was correct, which is what made this look like a rendering glitch rather
 * than a rule: the defaults are pixel figures, so only a resize could expose it.
 *
 * `preserve-pixel-size` on the two rails says the true thing about them: a page
 * thumbnail and an inspector field want the width they want, at any window
 * size. The canvas keeps the default and is therefore the one panel that
 * absorbs the difference, which is also the library's requirement — a group
 * needs at least one relative panel or there is nothing to give the remainder
 * to.
 */
const PIXEL_RAIL = "preserve-pixel-size" as const;
const LEFT_RAIL = { default: 232, min: 180, max: 360 };
const RIGHT_PANEL = { default: 344, min: 288, max: 520 };

/**
 * The inspector's height, also in pixels, and the library takes what is left.
 *
 * The first version split the right column 55/45 by percentage and it clipped
 * in the running app: at 1440×900 the column is 836px, so the library got
 * 459px for 983px of content and "Titlu" — the first item of the second group —
 * was cut across the middle by the seam, with the inspector's raised card
 * starting 1px below it. It read as one panel lying on top of another.
 *
 * A percentage was the wrong unit for the same reason it was wrong on the
 * horizontal axis. What the inspector needs is not a share of the window but a
 * height: a title and two fields, about 300px, and no more — an inspector twice
 * that is empty space taken from the one region that genuinely has more to show
 * than it can fit. So the inspector is sized and the library is given the
 * remainder, which is the honest description of the two.
 *
 * The library still scrolls, and that is fine now that it has a title bar which
 * stays put — see `library-panel.tsx`. What was wrong before was not the
 * scrolling; it was that nothing said the region scrolled.
 */
const INSPECTOR = { default: 320, min: 224, max: 560 };
const LIBRARY_MIN = 176;

export interface BuilderScreenProps {
  document: EvaluationProject;
}

export function BuilderScreen({ document }: BuilderScreenProps) {
  const [store] = useState(() => createEditorStore(document));

  return (
    <EditorStoreProvider value={{ editor: store }}>
      <BuilderBody />
    </EditorStoreProvider>
  );
}

/**
 * Split from the component above only so that the hooks below it can read the
 * store through context rather than being handed the instance the provider is
 * still in the middle of publishing.
 */
function BuilderBody() {
  const store = useEditorStore();
  const live = useEditor((state) => state.document);
  const saveState = useAutosave(live);
  const [mode, setMode] = useState<RenderMode>("edit");

  useEditorHotkeys(store);

  return (
    <CanvasDragProvider>
      <div className="flex h-svh flex-col bg-background">
        <BuilderToolbar
          saveState={saveState}
          mode={mode}
          onModeChange={setMode}
        />

        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1"
        >
          <ResizablePanel
            defaultSize={LEFT_RAIL.default}
            minSize={LEFT_RAIL.min}
            maxSize={LEFT_RAIL.max}
            groupResizeBehavior={PIXEL_RAIL}
          >
            <PagesRail />
          </ResizablePanel>

          {/**
           * Each seam is named for what it moves.
           *
           * `@ludicon/ui` defaults every separator to "Redimensionează panoul",
           * which is right for a component that cannot know what it sits between
           * and useless three times in one Tab pass — see the note on
           * `ResizableHandle`.
           */}
          <ResizableHandle aria-label={EVALUATION_COPY.resizePages} />

          <ResizablePanel>
            <EditorCanvas mode={mode} />
          </ResizablePanel>

          <ResizableHandle
            withGrip
            aria-label={EVALUATION_COPY.resizeSidePanel}
          />

          <ResizablePanel
            defaultSize={RIGHT_PANEL.default}
            minSize={RIGHT_PANEL.min}
            maxSize={RIGHT_PANEL.max}
            groupResizeBehavior={PIXEL_RAIL}
          >
            {/**
             * Library above, inspector below, with a seam between them rather
             * than one long scroll.
             *
             * Stacked in a single scroller was the first attempt and it was
             * wrong in a way only the running app showed: with the library's
             * three groups open, the inspector sits about 900px down, so
             * selecting a piece appeared to do nothing at all. Splitting the
             * region means the settings of what you just clicked are always on
             * screen, and the teacher decides how the height is shared.
             *
             * Neither panel is wrapped in a scroller here. Each owns its own,
             * below its own title bar, so the title survives the scroll — a panel
             * whose heading scrolls away is a panel a teacher has to remember
             * the name of.
             */}
            <ResizablePanelGroup
              orientation="vertical"
              className="border-l border-border bg-panel"
            >
              <ResizablePanel minSize={LIBRARY_MIN}>
                <LibraryPanel />
              </ResizablePanel>

              <ResizableHandle
                withGrip
                aria-label={EVALUATION_COPY.resizeSettings}
              />

              <ResizablePanel
                defaultSize={INSPECTOR.default}
                minSize={INSPECTOR.min}
                maxSize={INSPECTOR.max}
                groupResizeBehavior={PIXEL_RAIL}
              >
                <InspectorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </CanvasDragProvider>
  );
}
