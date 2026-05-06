"use server";

import { apiClient } from "@/lib/api-client";
import { cookies } from "next/headers";

export async function exportGPX(
  routeId: string
): Promise<{ gpxContent: string } | { error: string }> {
  const cookieStore = await cookies();
  try {
    const { data, error } = await apiClient.GET("/routes/{route_id}/gpx", {
      params: {
        path: { route_id: routeId },
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
      parseAs: "text",
    });

    if (error) {
      return { error: "エクスポートに失敗しました" };
    }

    return { gpxContent: data as string };
  } catch {
    return {
      error:
        "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
    };
  }
}
