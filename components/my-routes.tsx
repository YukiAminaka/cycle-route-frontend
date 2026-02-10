"use client";

import {
  searchMyRoutes,
  SearchMyRoutesState,
} from "@/features/routes/actions/search-my-routes";
import { searchRouteSchema } from "@/features/routes/types/schema";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Bike, Clock, Mountain, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

export function MyRoutes() {
  const router = useRouter();
  const [state, action, isPending] = useActionState<
    SearchMyRoutesState | null,
    FormData
  >(searchMyRoutes, null);

  // useForm を使ってフォーム状態を管理
  const [form, fields] = useForm({
    // 最後の送信結果を同期
    lastResult: state?.submission,

    // クライアント側でもバリデーションを実行
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: searchRouteSchema });
    },

    // バリデーションのタイミング設定
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDistance = (distance: number | undefined) => {
    if (!distance) return "0 km";
    if (distance < 1000) {
      return `${distance.toFixed(1)}m`;
    }

    return `${(distance / 1000).toFixed(1)} km`;
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return "0h 0m";
    const hours = Math.floor(duration / 360);
    const minutes = Math.round((duration / 360 - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const handleViewDetails = (routeId: string | undefined) => {
    if (routeId) {
      router.push(`/routes/${routeId}`);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Myルート</h1>
        </div>

        <Button
          onClick={() => router.push("/routes/new")}
          className="mb-6 bg-primary hover:bg-primary/90"
        >
          新しいルートを作成
        </Button>

        {/* 検索フォーム */}
        <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={fields.keyword?.id}
                name={fields.keyword?.name}
                placeholder="キーワードで検索"
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "検索中..." : "検索"}
            </Button>
          </div>

          {/* フォーム全体のエラーメッセージ */}
          {form.errors && (
            <div className="mb-4 text-sm text-destructive">
              {form.errors.join(", ")}
            </div>
          )}
          {fields.keyword?.errors && (
            <div className="mb-4 text-sm text-destructive">
              {fields.keyword.errors}
            </div>
          )}
        </form>

        {/* 検索結果 */}
        {state?.data?.routes && state.data.routes.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            ルートが見つかりません
          </div>
        )}

        {state?.data?.routes && state.data.routes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {state.data.routes.map((route) => (
              <Card
                key={route.id}
                className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                onClick={() => handleViewDetails(route.id)}
              >
                <div className="relative aspect-video bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    ルートプレビュー
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(route.created_at)}
                    </span>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{route.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bike className="h-4 w-4" />
                      <span>{formatDistance(route.distance)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(route.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mountain className="h-4 w-4" />
                      <span>{route.elevation_gain ?? 0} m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
