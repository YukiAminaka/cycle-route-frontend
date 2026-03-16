import { apiClient } from "@/lib/api-client";
import { cookies } from "next/headers";
import "server-only";

export async function getUserInfo(id: string) {
  const cookieStore = await cookies();
  return apiClient.GET("/users/{id}", {
    params: {
      path: { id: id },
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
}
