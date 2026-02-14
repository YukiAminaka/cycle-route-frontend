"use client";

import { RouteStateStoreProvider } from "@/features/routes/provider/route-state-provider";
import { RoutingProfileStoreProvider } from "@/features/routes/provider/routing-profile-provider";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteStateStoreProvider>
      <RoutingProfileStoreProvider>{children}</RoutingProfileStoreProvider>
    </RouteStateStoreProvider>
  );
}
