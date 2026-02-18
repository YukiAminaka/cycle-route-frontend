"use client";

import { type ReactNode, createContext, useState } from "react";

import {
  defaultEditMetaState,
  editMetaStore,
  loadEditMeta,
} from "../stores/editMetaStore";

export type EditMetaStoreApi = ReturnType<typeof editMetaStore>;

export const EditMetaStoreContext = createContext<EditMetaStoreApi | undefined>(
  undefined
);

export interface EditMetaStoreProviderProps {
  children: ReactNode;
}

// localStorageから初期状態を復元
const getInitialState = () => {
  const savedMeta = loadEditMeta();
  if (savedMeta) {
    return { editMeta: savedMeta };
  }
  return defaultEditMetaState;
};

export const EditMetaStoreProvider = ({
  children,
}: EditMetaStoreProviderProps) => {
  const [store] = useState(() => editMetaStore(getInitialState()));
  return (
    <EditMetaStoreContext.Provider value={store}>
      {children}
    </EditMetaStoreContext.Provider>
  );
};
