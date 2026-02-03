"use server";

import { apiClient } from "@/lib/api-client";
import { parseWithZod } from "@conform-to/zod";
import { createRouteSchema } from "../types/schema";

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

  try {
    const { error } = await apiClient.POST("/routes", {
      // OpenAPI定義のbody型が不完全なため、anyでキャスト
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: validData as any,
    });

    if (error) {
      return submission.reply({
        formErrors: [error.msg || "ルートの作成に失敗しました"],
      });
    }

    // 成功時はsuccessステータスを返す
    return submission.reply({ resetForm: true });
  } catch (error) {
    // 予期しないエラー（500エラーなど）をキャッチ
    return submission.reply({
      formErrors: [
        "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
      ],
    });
  }
}
