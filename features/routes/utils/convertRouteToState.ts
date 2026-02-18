import type { RouteResponseModel } from "@/types/api";
import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import type { FeatureCollection } from "geojson";
import type { RouteState } from "../stores/routeStateStore";

/**
 * FeatureCollection または直接のGeometryからPointを抽出する
 * サーバーからのデータはFeatureCollection形式で保存されている
 */
function extractPointGeometry(jsonStr: string): Point {
  const parsed = JSON.parse(jsonStr);

  // FeatureCollection形式の場合
  if (parsed.type === "FeatureCollection") {
    const fc = parsed as FeatureCollection;
    const firstFeature = fc.features[0];
    if (firstFeature?.geometry?.type === "Point") {
      return firstFeature.geometry as Point;
    }
  }

  // 直接Point形式の場合
  if (parsed.type === "Point") {
    return parsed as Point;
  }

  // フォールバック
  return { type: "Point", coordinates: [0, 0] };
}

/**
 * FeatureCollection または直接のGeometryからLineStringを抽出する
 */
function extractLineStringGeometry(jsonStr: string): LineString | null {
  const parsed = JSON.parse(jsonStr);

  // FeatureCollection形式の場合
  if (parsed.type === "FeatureCollection") {
    const fc = parsed as FeatureCollection;
    const firstFeature = fc.features[0];
    if (firstFeature?.geometry?.type === "LineString") {
      return firstFeature.geometry as LineString;
    }
  }

  // 直接LineString形式の場合
  if (parsed.type === "LineString") {
    return parsed as LineString;
  }

  return null;
}

/**
 * RouteResponseModel を RouteState に変換する
 * 編集モードでサーバーから取得したルートを地図に表示するために使用
 */
export function convertRouteToState(route: RouteResponseModel): RouteState {
  // waypoints を Feature<Point>[] に変換
  const waypoints: Feature<Point>[] = (route.waypoints ?? []).map(
    (wp, index) => {
      const geometry = wp.location
        ? extractPointGeometry(wp.location)
        : { type: "Point" as const, coordinates: [0, 0] };

      return {
        type: "Feature" as const,
        geometry,
        properties: {
          type: "WAYPOINT",
          index,
        },
      };
    }
  );

  // snappoints も waypoints と同じ位置を使用
  // （サーバーに保存されているのはスナップされた位置のため）
  const snappoints: Feature<Point>[] = waypoints.map((wp, index) => ({
    type: "Feature" as const,
    geometry: wp.geometry,
    properties: {
      type: "SNAPPOINT",
      index,
    },
  }));

  // routelines を Feature<LineString>[][] に変換
  // legIndex, departSnappointProperties, arriveSnappointProperties はライブラリの onMove で必要
  const routelines: Feature<LineString>[][] = [];
  if (route.path_geom) {
    const geometry = extractLineStringGeometry(route.path_geom);
    if (geometry) {
      // ライブラリが onMove 時に JSON.parse() するため、JSON文字列として保存
      const departSnappointProperties = JSON.stringify({
        type: "SNAPPOINT",
        highlight: false,
        category: "WAYPOINT",
        waypointProperties: {
          type: "WAYPOINT",
          index: 0,
        },
      });
      const arriveSnappointProperties = JSON.stringify({
        type: "SNAPPOINT",
        highlight: false,
        category: "WAYPOINT",
        waypointProperties: {
          type: "WAYPOINT",
          index: 1,
        },
      });

      // 全体で1つのルートラインとして扱う
      routelines.push([
        {
          type: "Feature" as const,
          geometry,
          properties: {
            type: "ROUTELINE",
            route: "SELECTED",
            legIndex: JSON.stringify(0),
            routeIndex: 0,
            departSnappointProperties,
            arriveSnappointProperties,
          },
        },
      ]);
    }
  }

  return {
    waypoints,
    snappoints,
    routelines,
  };
}
