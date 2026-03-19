"use server";

import { apiClient } from "@/lib/api-client";
import { CreateRouteRequest } from "@/types/api";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  coursePoints,
  coursePointsType,
  createRouteDetailSchema,
  createRouteDetailType,
  createRouteFormSchema,
  waypoints,
  waypointsType,
} from "../types/schema";

export async function createRoute(
  waypointsData: waypointsType,
  coursePointsData: coursePointsType,
  createRouteDetail: createRouteDetailType,
  _prevState: unknown,
  formData: FormData
) {
  // フォームデータのバリデーション
  const submission = parseWithZod(formData, {
    schema: createRouteFormSchema,
  });
  // バリデーションエラーがある場合は早期リターン
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Server Action引数のバリデーション
  const waypointsResult = waypoints.safeParse(waypointsData);
  const coursePointsResult = coursePoints.safeParse(coursePointsData);
  const detailResult = createRouteDetailSchema.safeParse(createRouteDetail);

  if (!waypointsResult.success) {
    return submission.reply({
      formErrors: [
        waypointsResult.error.errors[0]?.message ||
          "ウェイポイントのデータが不正です",
      ],
    });
  }
  if (!coursePointsResult.success) {
    return submission.reply({
      formErrors: [
        coursePointsResult.error.errors[0]?.message ||
          "コースポイントのデータが不正です",
      ],
    });
  }
  if (!detailResult.success) {
    return submission.reply({
      formErrors: [
        detailResult.error.errors[0]?.message || "ルート詳細データが不正です",
      ],
    });
  }

  // バリデーション成功時のデータを結合
  const validData: CreateRouteRequest = {
    ...submission.value,
    ...detailResult.data,
    waypoints: waypointsResult.data,
    course_points: coursePointsResult.data,
  };
  const cookieStore = await cookies();
  try {
    const { error } = await apiClient.POST("/routes", {
      body: validData,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    // キャッシュの再検証
    revalidatePath("/routes");

    if (error) {
      return submission.reply({
        formErrors: [error.msg || "ルートの作成に失敗しました"],
      });
    }

    // 成功時はsuccessステータスを返す
    return { ...submission.reply({ resetForm: true }), status: "success" as const };
  } catch {
    // 予期しないエラー（500エラーなど）をキャッチ
    return submission.reply({
      formErrors: [
        "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
      ],
    });
  }
}
