"use server";

import { apiClient } from "@/lib/api-client";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { z } from "zod";

// OpenAPI型定義に基づいたスキーマ定義
export const createRouteSchema = z.object({
  routeName: z.string().min(1, "ルート名を入力してください"),
  description: z.string().optional(),
  distance: z.number().min(0, "距離は0以上である必要があります"),
  duration: z.number().min(0, "所要時間は0以上である必要があります"),
  elevationGain: z.number().min(0, "獲得標高は0以上である必要があります"),
  elevationLoss: z.number().min(0, "下降標高は0以上である必要があります"),
  pathGeom: z.string().min(1, "ルートのジオメトリが必要です"),
  firstPoint: z.string().min(1, "開始地点が必要です"),
  lastPoint: z.string().min(1, "終了地点が必要です"),
  visibility: z.number().int().min(0).max(1),
  coursePoints: z.string().optional(),
  waypoints: z.string().optional(),
});

export async function createRoute(_prevState: unknown, formData: FormData) {
  // フォームデータのバリデーション
  const submission = parseWithZod(formData, {
    schema: createRouteSchema,
  });
  // バリデーションエラーがある場合は早期リターン
  if (submission.status !== "success") {
    return submission.reply();
  }

  // バリデーション成功時のデータ
  const validData = submission.value;

  const { error } = await apiClient.POST("/routes", {
    // OpenAPI定義のbody型が不完全なため、anyでキャスト
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: submission.value as any,
  });

  if (error) {
    return submission.reply({
      formErrors: [error.msg || "ルートの作成に失敗しました"],
    });
  }

  redirect("/dashboard");
}
