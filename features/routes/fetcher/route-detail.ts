// Client Bundle内でimportするとエラー
import { apiClient } from "@/lib/api-client";
import { cookies } from "next/headers";
import "server-only";

export async function getRouteDetail(id: string) {
  const cookieStore = await cookies();
  return apiClient.GET("/routes/{route_id}", {
    params: {
      path: { route_id: id },
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
}
