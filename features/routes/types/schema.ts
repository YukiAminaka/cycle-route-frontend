import { z } from "zod";

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
  visibility: z.coerce.number().int().min(0).max(2),
  coursePoints: z.string().optional(),
  waypoints: z.string().optional(),
});

export const createRouteFormSchema = z.object({
  routeName: z.string().min(1, "ルート名を入力してください"),
  description: z.string().optional(),
  visibility: z.number().int().min(0).max(2),
});
