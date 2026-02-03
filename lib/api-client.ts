import type { paths } from "@/types/api";
import createClient from "openapi-fetch";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});
