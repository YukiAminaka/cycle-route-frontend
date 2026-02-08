"use client";

import { type ReactNode, createContext, useState } from "react";

import { routingProfileStore } from "../stores/routingProfileStore";

export type RoutingProfileStoreApi = ReturnType<typeof routingProfileStore>;

export const RoutingProfileStoreContext = createContext<
  RoutingProfileStoreApi | undefined
>(undefined);

export interface RoutingProfileStoreProviderProps {
  children: ReactNode;
}

export const RoutingProfileStoreProvider = ({
  children,
}: RoutingProfileStoreProviderProps) => {
  const [store] = useState(() => routingProfileStore());
  return (
    <RoutingProfileStoreContext.Provider value={store}>
      {children}
    </RoutingProfileStoreContext.Provider>
  );
};
