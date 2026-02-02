"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { z } from "zod";

const routeSchema = z.object({
  routeName: z.string().min(1, "ルート名を入力してください"),
  description: z.string().optional(),
  distance: z.number().min(0, "距離は0以上である必要があります"),
  duration: z.number().min(0, "所要時間は0以上である必要があります"),
  elevationGain: z.number().min(0, "獲得標高は0以上である必要があります"),
  elevationLoss: z.number().min(0, "下降標高は0以上である必要があります"),
  pathGeom: z.string().min(1, "ルートのジオメトリが必要です"),
  firstPoint: z.object({
    lng: z.number(),
    lat: z.number(),
  }),
  lastPoint: z.object({
    lng: z.number(),
    lat: z.number(),
  }),
  visibility: z.enum(["public", "private"]),
  courcePoints: z.string().optional(),
  Waypoints: z.array(
    z.object({
      lng: z.number(),
      lat: z.number(),
    })
  ),
});

export async function createRoute(formData: FormData) {
  const data = parseWithZod(formData, {
    schema: routeSchema,
  });

  redirect("/dashboard");
}
