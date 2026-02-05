import { z } from "zod";

export const coursePoints = z
  .array(
    z.object({
      bearing_after: z.number().min(0).max(360).optional(),
      bearing_before: z.number().min(0).max(360).optional(),
      cum_dist_m: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      instruction: z.string().optional(),
      location: z.string(),
      maneuver_type: z.string().optional(),
      modifier: z.string().optional(),
      road_name: z.string().max(80).optional(),
      seg_dist_m: z.number().min(0).optional(),
    })
  )
  .max(1000, "コースポイントは最大1000点までです");

export type coursePointsType = z.infer<typeof coursePoints>;

export const waypoints = z
  .array(
    z.object({
      location: z.string(),
    })
  )
  .max(200, "ウェイポイントは最大200点までです");

export type waypointsType = z.infer<typeof waypoints>;

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
  coursePoints: z.array(coursePoints),
  waypoints: z.array(waypoints),
});

export type createRouteType = z.infer<typeof createRouteSchema>;

export const createRouteFormSchema = z.object({
  name: z.string().min(1, "ルート名を入力してください").max(50),
  description: z.string().max(500, "500文字以内で入力してください").optional(),
  visibility: z.coerce.number().int().min(0).max(2),
});

export const createRouteDetailSchema = z.object({
  distance: z.number().min(0),
  duration: z.number().min(0),
  elevation_gain: z.number().min(0),
  elevation_loss: z.number().min(0),
  path_geom: z.string().min(1),
  first_point: z.string().min(1),
  last_point: z.string().min(1),
});

export type createRouteDetailType = z.infer<typeof createRouteDetailSchema>;
