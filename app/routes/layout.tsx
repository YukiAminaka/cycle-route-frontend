"use client";

import { RoutingProfileStoreProvider } from "@/features/routes/provider/routing-profile-provider";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoutingProfileStoreProvider>{children}</RoutingProfileStoreProvider>
  );
}
