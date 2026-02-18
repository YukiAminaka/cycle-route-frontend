"use client";

import { EditMetaStoreProvider } from "@/features/routes/provider/edit-meta-provider";
import { RouteStateStoreProvider } from "@/features/routes/provider/route-state-provider";
import { RoutingProfileStoreProvider } from "@/features/routes/provider/routing-profile-provider";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditMetaStoreProvider>
      <RouteStateStoreProvider>
        <RoutingProfileStoreProvider>{children}</RoutingProfileStoreProvider>
      </RouteStateStoreProvider>
    </EditMetaStoreProvider>
  );
}
