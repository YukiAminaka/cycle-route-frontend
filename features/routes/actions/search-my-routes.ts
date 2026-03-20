"use server";

import { apiClient } from "@/lib/api-client";
import { RouteListResponse } from "@/types/api";
import { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cookies } from "next/headers";
import { searchRouteSchema } from "../types/schema";

export type SearchMyRoutesState = {
  submission: SubmissionResult<string[]> | null;
  data: RouteListResponse | null;
};

export async function searchMyRoutes(
  _prevState: SearchMyRoutesState | null,
  formData: FormData
): Promise<SearchMyRoutesState> {
  // フォームデータのバリデーション
  const submission = parseWithZod(formData, {
    schema: searchRouteSchema,
  });

  // バリデーションエラーがある場合
  if (submission.status !== "success") {
    return {
      submission: submission.reply(),
      data: _prevState?.data ?? null,
    };
  }

  const searchParams = submission.value;
  const cookieStore = await cookies();

  try {
    // クエリパラメータを構築
    const query: Record<string, string> = {};

    if (searchParams.keyword) {
      query.keyword = searchParams.keyword;
    }
    if (searchParams.distanceMin !== undefined) {
      query.min_distance = String(searchParams.distanceMin);
    }
    if (searchParams.distanceMax !== undefined) {
      query.max_distance = String(searchParams.distanceMax);
    }
    if (searchParams.elevationMin !== undefined) {
      query.min_elevation = String(searchParams.elevationMin);
    }
    if (searchParams.elevationMax !== undefined) {
      query.max_elevation = String(searchParams.elevationMax);
    }
    if (searchParams.author) {
      query.author = searchParams.author;
    }
    if (searchParams.visibility !== undefined) {
      query.visibility = String(searchParams.visibility);
    }

    const { data, error } = await apiClient.GET("/routes", {
      params: {
        query,
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (error) {
      return {
        submission: submission.reply({
          formErrors: ["検索に失敗しました"],
        }),
        data: _prevState?.data ?? null,
      };
    }

    return {
      submission: submission.reply(),
      data,
    };
  } catch {
    return {
      submission: submission.reply({
        formErrors: ["検索中にエラーが発生しました"],
      }),
      data: _prevState?.data ?? null,
    };
  }
}
