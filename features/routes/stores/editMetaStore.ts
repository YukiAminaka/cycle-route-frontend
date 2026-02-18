import { createStore } from "zustand/vanilla";

export interface EditMeta {
  routeId: string;
  routeName: string;
}

interface EditMetaState {
  editMeta: EditMeta | null;
}

export type EditMetaActions = {
  setEditMeta: (meta: EditMeta) => void;
  clearEditMeta: () => void;
};

export type EditMetaStore = EditMetaState & EditMetaActions;

const STORAGE_KEY = "route-edit-meta";

// localStorage 安全ラッパ
const saveEditMeta = (meta: EditMeta | null) => {
  if (typeof window === "undefined") return;
  try {
    if (meta) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

export const loadEditMeta = (): EditMeta | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as EditMeta;
    }
  } catch {}
  return null;
};

export const defaultEditMetaState: EditMetaState = {
  editMeta: null,
};

export const editMetaStore = (
  initState: EditMetaState = defaultEditMetaState
) => {
  return createStore<EditMetaStore>()((set) => ({
    ...initState,
    setEditMeta: (meta) => {
      saveEditMeta(meta);
      set({ editMeta: meta });
    },
    clearEditMeta: () => {
      saveEditMeta(null);
      set({ editMeta: null });
    },
  }));
};
