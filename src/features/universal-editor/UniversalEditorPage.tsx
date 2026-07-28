import UpeBottomPanel from "./components/UpeBottomPanel";
import UpeCanvas from "./components/UpeCanvas";
import UpeHeader from "./components/UpeHeader";
import UpeLeftSidebar from "./components/UpeLeftSidebar";
import UpeRightSidebar from "./components/UpeRightSidebar";
import UpeShell from "./components/UpeShell";
import { useUniversalEditor } from "./hooks/useUniversalEditor";

function UniversalEditorPage() {
  const editor = useUniversalEditor();

  return (
    <UpeShell
      bottomOpen={editor.bottomOpen}
      header={
        <UpeHeader
          lessonTitle={editor.document.lessonTitle}
          lessonProjectId={editor.document.lessonProjectId}
          title={editor.document.title}
          versionLabel={editor.document.versionLabel}
          autosave={editor.autosave}
          pieScore={editor.pieScore}
          previewMode={editor.previewMode}
          onPreviewMode={editor.setPreviewMode}
          onUndo={editor.undo}
          bottomOpen={editor.bottomOpen}
          onToggleBottom={() => editor.setBottomOpen((v) => !v)}
        />
      }
      left={
        <UpeLeftSidebar
          tab={editor.leftTab}
          onTab={editor.setLeftTab}
          document={editor.document}
          selectedBlockId={editor.selectedBlockId}
          onSelectBlock={editor.setSelectedBlockId}
          searchQuery={editor.searchQuery}
          onSearch={editor.setSearchQuery}
          searchHits={editor.searchHits}
          onInsert={editor.insert}
        />
      }
      canvas={
        <UpeCanvas
          document={editor.document}
          selectedBlockId={editor.selectedBlockId}
          previewMode={editor.previewMode}
          onSelect={editor.setSelectedBlockId}
          onChangeText={editor.updateSelectedContent}
        />
      }
      right={
        <UpeRightSidebar
          tab={editor.rightTab}
          onTab={editor.setRightTab}
          selectedBlock={editor.selectedBlock}
          objectives={editor.document.learningObjectives}
          competencies={editor.document.competencies}
          suggestions={editor.pieSuggestions}
          onMove={editor.moveSelected}
          onDuplicate={editor.duplicateSelected}
          onToggleLock={editor.toggleLockSelected}
          onHide={editor.hideSelected}
          onDelete={editor.deleteSelected}
        />
      }
      bottom={
        <UpeBottomPanel
          tab={editor.bottomTab}
          onTab={editor.setBottomTab}
          issues={editor.validationIssues}
          versions={editor.versions}
          previewMode={editor.previewMode}
          onRestore={editor.restoreVersion}
          onJumpToBlock={editor.setSelectedBlockId}
          publishProfileId={editor.publishProfileId}
          onPublishProfile={editor.setPublishProfileId}
          previewCompleted={editor.previewCompleted}
          onMarkPreviewed={editor.markPreviewed}
          publishMessage={editor.publishMessage}
          onPublish={editor.publish}
        />
      }
    />
  );
}

export default UniversalEditorPage;
