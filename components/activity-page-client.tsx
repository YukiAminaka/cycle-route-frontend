"use client";

import { useEffect, useState } from "react";
import { Activity } from "@/components/activity";
import { getSavedRoutes } from "@/lib/route-storage";
import type { Route } from "@/types/route";

export function ActivityPageClient() {
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);

  useEffect(() => {
    setSavedRoutes(getSavedRoutes());
  }, []);

  return <Activity routes={savedRoutes} />;
}
