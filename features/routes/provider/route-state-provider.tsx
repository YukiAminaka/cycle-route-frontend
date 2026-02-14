"use client";

import { type ReactNode, createContext, useState } from "react";

import {
  type RouteState,
  defaultInitState,
  routeStateStore,
} from "../stores/routeStateStore";

export type RouteStateStoreApi = ReturnType<typeof routeStateStore>;

export const RouteStateStoreContext = createContext<
  RouteStateStoreApi | undefined
>(undefined);

export interface RouteStateStoreProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "route-planner-state";

// localStorageから初期状態を復元
const getInitialState = () => {
  if (typeof window === "undefined") return defaultInitState;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as RouteState;
      if (parsed.waypoints?.length > 0) {
        return {
          past: [],
          present: parsed,
          future: [],
        };
      }
    }
  } catch (e) {
    console.warn("Failed to restore route state:", e);
  }
  return defaultInitState;
};

export const RouteStateStoreProvider = ({
  children,
}: RouteStateStoreProviderProps) => {
  const [store] = useState(() => routeStateStore(getInitialState()));
  return (
    <RouteStateStoreContext.Provider value={store}>
      {children}
    </RouteStateStoreContext.Provider>
  );
};
