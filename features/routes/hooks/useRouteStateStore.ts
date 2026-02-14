"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import { RouteStateStoreContext } from "../provider/route-state-provider";
import type { RouteStateStore } from "../stores/routeStateStore";

export const useRouteStateStore = <T>(
  selector: (store: RouteStateStore) => T
): T => {
  const context = useContext(RouteStateStoreContext);
  if (!context) {
    throw new Error(
      "useRouteStateStore must be used within RouteStateStoreProvider"
    );
  }
  return useStore(context, selector);
};
