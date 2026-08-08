import { Link, useSearchParams } from "react-router-dom";
import { BlockEditorProvider } from "./hooks/useBlockEditor";
import { UniversalBlockEditor } from "./components/UniversalBlockEditor";
import { blockDocumentStore } from "./services/documentStore";

/**
 * Standalone Universal Block Editor page.
 * Route: `/block-editor` or `/block-editor?doc=`
 */
export function BlockEditorPage() {
  const [params] = useSearchParams();
  const docId = params.get("doc");
  const ensured = blockDocumentStore.ensure(docId);

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
        >
          ← Home
        </Link>
        <button
          type="button"
          className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline"
          onClick={() => {
            const doc = blockDocumentStore.create({
              title: "Untitled resource",
            });
            window.location.href = `/block-editor?doc=${doc.id}`;
          }}
        >
          New document
        </button>
      </div>
      <BlockEditorProvider documentId={ensured.id}>
        <UniversalBlockEditor />
      </BlockEditorProvider>
    </div>
  );
}

export default BlockEditorPage;
