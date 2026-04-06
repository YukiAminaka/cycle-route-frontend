import type { paths } from "@/types/api.d";
import { GoogleAuth } from "google-auth-library";
import createClient from "openapi-fetch";

const auth = new GoogleAuth();

const client = createClient<paths>({
  baseUrl: process.env.API_URL,
});

// バックエンドのcloud runと通信するためには、リクエストにIDトークンを付与する必要がある
client.use({
  async onRequest({ request }) {
    const apiUrl = process.env.API_URL;
    if (apiUrl) {
      // メタデータサーバーからIDトークンを取得してヘッダーに付与
      const idTokenClient = await auth.getIdTokenClient(apiUrl);
      const headers = await idTokenClient.getRequestHeaders();
      for (const [key, value] of Object.entries(headers)) {
        request.headers.set(key, value);
      }
    }
    return request;
  },
});

export const apiClient = client;
