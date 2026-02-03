"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createRoute } from "@/features/routes/actions/create-route";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createRouteSchema } from "../types/schema";

interface CreateRouteDialogProps {
  routeName: string;
  routeInfo: {
    distance: number;
    duration: number;
    elevationGain: number;
    elevationLoss: number;
    pathGeom: string;
    firstPoint: string;
    lastPoint: string;
  } | null;
}

export function CreateRouteDialog({
  routeName,
  routeInfo,
}: CreateRouteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // useActionState を使って Action を接続
  const [lastResult, action, isPending] = useActionState(createRoute, null);

  // useForm を使ってフォーム状態を管理
  const [form, fields] = useForm({
    constraint: getZodConstraint(createRouteSchema), // zodのスキーマに応じてConformがHTMLのバリデーション属性を自動的に付与してくれるオプション
    lastResult, // server actionsの結果が返却される
    // クライアント側でのバリデーションをする
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createRouteSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      // 成功時にトーストを表示してダイアログを閉じ、ダッシュボードに遷移
      toast.success("ルートが正常に保存されました");
      setOpen(false);
      router.push("/dashboard");
    } else if (lastResult?.status === "error") {
      // エラー時はトーストでエラーメッセージを表示（ダイアログは閉じない）
      const errorMessage = form.errors?.[0] || "ルートの保存中にエラーが発生しました";
      toast.error(errorMessage);
    }
  }, [lastResult, form.errors, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-medium h-11"
          disabled={!routeInfo}
        >
          保存
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} action={action}>
          <DialogHeader>
            <DialogTitle>ルート保存</DialogTitle>
            <DialogDescription>
              ルートのタイトルと説明を入力してください。
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="routeName">タイトル</Label>
              <Input
                id="routeName"
                name="routeName"
                key={fields.routeName.key}
                defaultValue={routeName}
                aria-invalid={!!fields.routeName.errors}
              />
              {fields.routeName.errors && (
                <p className="text-sm text-red-500">
                  {fields.routeName.errors[0]}
                </p>
              )}
            </Field>
            <Field>
              <Label htmlFor="visibility">公開範囲</Label>
              <RadioGroup
                name={fields.visibility.name}
                key={fields.visibility.key}
                defaultValue="0"
                aria-invalid={!!fields.visibility.errors}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="public" />
                  <Label
                    htmlFor="public"
                    className="font-normal cursor-pointer"
                  >
                    公開
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="private" />
                  <Label
                    htmlFor="private"
                    className="font-normal cursor-pointer"
                  >
                    非公開
                  </Label>
                </div>
              </RadioGroup>
              {fields.visibility.errors && (
                <p className="text-sm text-red-500">
                  {fields.visibility.errors[0]}
                </p>
              )}
            </Field>
            <Field>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                key={fields.description.key}
              />
            </Field>

            {/* Hidden fields for route data */}
            <input
              type="hidden"
              name="distance"
              value={routeInfo?.distance ?? 0}
            />
            <input
              type="hidden"
              name="duration"
              value={routeInfo?.duration ?? 0}
            />
            <input
              type="hidden"
              name="elevationGain"
              value={routeInfo?.elevationGain ?? 0}
            />
            <input
              type="hidden"
              name="elevationLoss"
              value={routeInfo?.elevationLoss ?? 0}
            />
            <input
              type="hidden"
              name="pathGeom"
              value={routeInfo?.pathGeom ?? ""}
            />
            <input
              type="hidden"
              name="firstPoint"
              value={routeInfo?.firstPoint ?? ""}
            />
            <input
              type="hidden"
              name="lastPoint"
              value={routeInfo?.lastPoint ?? ""}
            />
          </FieldGroup>

          {form.errors && (
            <p className="text-sm text-red-500 mt-2">{form.errors[0]}</p>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending || !routeInfo}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
