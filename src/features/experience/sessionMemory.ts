const LAST_WORKSPACE_KEY = "prima.experience.lastWorkspace";

export type LastWorkspaceMemory = {
  projectId: string;
  title: string;
  prompt: string;
  savedAt: string;
};

export function saveLastWorkspace(memory: LastWorkspaceMemory): void {
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

export function readLastWorkspace(): LastWorkspaceMemory | null {
  try {
    const raw = localStorage.getItem(LAST_WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastWorkspaceMemory;
    if (!parsed.projectId || !parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}
