import { apiClient } from "@/lib/api-client";
import { cookies } from "next/headers";
import "server-only";

export async function getLoggedInUserInfo() {
  const cookieStore = await cookies();
  return apiClient.GET("/users/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
}
