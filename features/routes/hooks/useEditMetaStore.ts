"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { EditMetaStoreContext } from "../provider/edit-meta-provider";
import type { EditMetaStore } from "../stores/editMetaStore";

export const useEditMetaStore = <T>(
  selector: (store: EditMetaStore) => T
): T => {
  const context = useContext(EditMetaStoreContext);
  if (!context) {
    throw new Error(
      "useEditMetaStore must be used within EditMetaStoreProvider"
    );
  }
  return useStore(context, selector);
};
