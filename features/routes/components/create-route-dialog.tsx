"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { RadioTabs, RadioTabsItem } from "@/components/ui/radio-tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createRoute,
  createRouteSchema,
} from "@/features/routes/actions/create-route";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useState } from "react";

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
  const [visibility, setVisibility] = useState("0"); // 0: public, 1: private

  // useActionState を使って Action を接続
  const [lastResult, action, isPending] = useActionState(
    createRoute,
    undefined
  );

  // useForm を使ってフォーム状態を管理
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createRouteSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog>
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
            <RadioTabs
              value={visibility}
              onValueChange={setVisibility}
            >
              <RadioTabsItem value="0">公開</RadioTabsItem>
              <RadioTabsItem value="1">非公開</RadioTabsItem>
            </RadioTabs>
            <input type="hidden" name="visibility" value={visibility} />
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
            <DialogClose asChild>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !routeInfo}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
