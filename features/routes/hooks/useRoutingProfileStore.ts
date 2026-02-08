"use client";

import { useContext } from "react";
import { useStore } from "zustand";

import {
  RoutingProfileStoreContext,
  type RoutingProfileStoreApi,
} from "../provider/routing-profile-provider";
import type { RoutingProfileStore } from "../stores/routingProfileStore";

export const useRoutingProfileStore = <T>(
  selector: (store: RoutingProfileStore) => T
): T => {
  const context = useContext(RoutingProfileStoreContext);
  if (!context) {
    throw new Error(
      "useRoutingProfileStore must be used within RoutingProfileStoreProvider"
    );
  }
  return useStore(context, selector);
};
