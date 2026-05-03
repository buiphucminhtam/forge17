import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Workspace {
  id: string;
  name: string;
  path: string;
  daemonPort: number;
  boardPort: number;
  status: 'online' | 'offline' | 'error';
}

interface HubState {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  isConnected: boolean;
  
  // Actions
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspaceStatus: (id: string, status: Workspace['status']) => void;
  setActiveWorkspace: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
}

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspace: null,
      isConnected: false,

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        })),

      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          activeWorkspace: state.activeWorkspace === id ? null : state.activeWorkspace,
        })),

      updateWorkspaceStatus: (id, status) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, status } : w
          ),
        })),

      setActiveWorkspace: (id) =>
        set({ activeWorkspace: id }),

      setConnected: (connected) =>
        set({ isConnected: connected }),
    }),
    {
      name: 'multica-hub-storage',
    }
  )
);
