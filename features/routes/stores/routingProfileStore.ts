import { createStore } from "zustand/vanilla";

export type RoutingProfileState = {
  routing_profiles: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling";
};

export type RoutingProfileActions = {
  setProfile: (profile: RoutingProfileState["routing_profiles"]) => void;
};

export type RoutingProfileStore = RoutingProfileState & RoutingProfileActions;

export const defaultInitState: RoutingProfileState = {
  routing_profiles: "mapbox/cycling",
};

export const routingProfileStore = (
  initState: RoutingProfileState = defaultInitState
) => {
  return createStore<RoutingProfileStore>()((set) => ({
    ...initState,
    setProfile: (profile) => set({ routing_profiles: profile }),
  }));
};
