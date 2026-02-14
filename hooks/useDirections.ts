import { useRoutingProfileStore } from "@/features/routes/hooks";
import type { RouteState } from "@/features/routes/stores/routeStateStore";
import CustomMapLibreGlDirections from "@/lib/custom-directions";
import type { CoursePointRequest } from "@/types/api";
import type { Coordinate, Route } from "@/types/route";
import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import {
  LoadingIndicatorControl,
  MapLibreGlDirectionsEventType,
} from "@maplibre/maplibre-gl-directions";
import { Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseDirectionsOptions {
  map: MapLibreMap | null | undefined;
  onRouteChange?: (cues: CoursePointRequest[]) => void;
  onStateChange?: (state: RouteState) => void;
}

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  elevation_gain: number; // meters
  elevation_loss: number; // meters
  path_geom: string; // GeoJSON geometry as string
  first_point: string; // GeoJSON point as string
  last_point: string; // GeoJSON point as string
}

interface UseDirectionsResult {
  waypoints: Coordinate[];
  routeInfo: RouteInfo | null;
  addWaypoint: (coord: Coordinate) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;
  undoLastWaypoint: () => void;
  restoreState: (state: RouteState) => void;
  isReady: boolean;
}

/**
 * Custom hook for managing MapLibre GL Directions
 * Handles waypoint management and route calculation
 */
export function useDirections({
  map,
  onRouteChange,
  onStateChange,
}: UseDirectionsOptions): UseDirectionsResult {
  const directionsRef = useRef<CustomMapLibreGlDirections | null>(null);
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const profile = useRoutingProfileStore((s) => s.routing_profiles);

  // コールバックをrefで管理して依存配列から外す
  const onRouteChangeRef = useRef(onRouteChange);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onRouteChangeRef.current = onRouteChange;
    onStateChangeRef.current = onStateChange;
    console.log("Updated onRouteChange and onStateChange refs");
  }, [onRouteChange, onStateChange]);

  // Initialize directions plugin
  useEffect(() => {
    if (!map) return;

    const initDirections = () => {
      // Cleanup existing instance
      if (directionsRef.current) {
        directionsRef.current.destroy();
        directionsRef.current = null;
      }

      const directions = new CustomMapLibreGlDirections(map, {
        api: "https://api.mapbox.com/directions/v5",
        profile,
        requestOptions: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          geometries: "geojson",
          steps: "true",
          alternatives: "false", // 代替ルートを返すか
          overview: "full",
        },
      });

      directions.interactive = true;
      map.addControl(new LoadingIndicatorControl(directions));
      directionsRef.current = directions;
      setIsReady(true);

      // 経路探索は毎回すべてのwaypointが含まれるのでつど追加されず全部をセットするようになっている。
      const handleRouteEnd = (
        event: MapLibreGlDirectionsEventType["fetchroutesend"]
      ) => {
        const dir = directionsRef.current;
        const apiResponse = event.data.directions;

        // waypointsを更新（スナップされた位置）
        setWaypoints(apiResponse?.waypoints?.map((wp) => wp.location) ?? []);
        const route = apiResponse?.routes?.[0] as Route | undefined;

        if (!route) return;
        console.log("renered");
        // Extract cue sheet from route steps
        const steps = (route.legs ?? []).flatMap((leg) => leg.steps ?? []);
        let cumDistM = 0;
        const coursePoints: CoursePointRequest[] = steps.map((step) => {
          const segDistM = step.distance ?? 0;
          cumDistM += segDistM;
          const maneuverLocation = step.maneuver?.location;
          return {
            location: maneuverLocation
              ? JSON.stringify({
                  type: "Point",
                  coordinates: maneuverLocation,
                })
              : "",
            road_name: step.name ?? "",
            seg_dist_m: segDistM,
            cum_dist_m: cumDistM,
            duration: step.duration ?? 0,
            maneuver_type: step.maneuver?.type,
            modifier: step.maneuver?.modifier,
            bearing_after: step.maneuver?.bearing_after,
            bearing_before: step.maneuver?.bearing_before,
            instruction: step.maneuver?.instruction,
          };
        });

        // todo: 標高データの取得と計算
        const elevation_gain = 0;
        const elevation_loss = 0;

        // Get first and last points from waypoints
        const coordinates = route.geometry?.coordinates ?? [];
        const firstPoint = coordinates[0];
        const lastPoint = coordinates[coordinates.length - 1];

        // Create route info
        const newRouteInfo: RouteInfo = {
          distance: route.distance ?? 0, // in meters
          duration: route.duration ?? 0, // in seconds
          elevation_gain, // meters
          elevation_loss, // meters
          path_geom: JSON.stringify(route.geometry), // GeoJSON LineString
          first_point: JSON.stringify({
            type: "Point",
            coordinates: firstPoint,
          }),
          last_point: JSON.stringify({
            type: "Point",
            coordinates: lastPoint,
          }),
        };

        setRouteInfo(newRouteInfo);

        if (onRouteChangeRef.current) {
          console.log("Course points:", coursePoints);
          onRouteChangeRef.current(coursePoints);
        }

        // 状態変更を通知（永続化・履歴用）
        // APIレスポンスから直接snappoints/routelinesを構築
        // （ライブラリ内部の状態更新を待たずに取得できる）
        if (onStateChangeRef.current && dir) {
          // snappointsをAPIレスポンスから構築
          // Mapbox APIが返すwaypointsはスナップされた位置
          const snappoints: Feature<Point>[] = (
            apiResponse?.waypoints ?? []
          ).map((wp, index) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: wp.location,
            },
            properties: {
              type: "SNAPPOINT",
              index,
            },
          }));

          // routelinesをAPIレスポンスから構築
          // 各legのgeometryをroutelinesとして保存
          const routelines: Feature<LineString>[][] = (route.legs ?? []).map(
            (_leg, legIndex) => {
              // legにはgeometryがないので、route全体のgeometryを使う
              // 複数legの場合は分割が必要だが、今は単純にroute全体を使用
              if (legIndex === 0) {
                return [
                  {
                    type: "Feature" as const,
                    geometry: route.geometry as LineString,
                    properties: {
                      type: "ROUTELINE",
                      route: 0,
                      leg: legIndex,
                    },
                  },
                ];
              }
              return [];
            }
          );

          onStateChangeRef.current({
            waypoints: dir.waypointsFeatures, // ユーザーがクリックした元の位置
            snappoints,
            routelines,
          });
        }
      };

      // ルートリクエスト完了時のイベントリスナーを登録
      directions.on("fetchroutesend", handleRouteEnd);

      // Cleanup function
      return () => {
        directions.off("fetchroutesend", handleRouteEnd);
        directions.destroy();
        directionsRef.current = null;
        setIsReady(false);
      };
    };

    if (map.loaded()) {
      return initDirections();
    } else {
      map.once("load", initDirections);
    }
  }, [map, profile]);

  const addWaypoint = useCallback((coord: Coordinate) => {
    const directions = directionsRef.current;
    if (!directions) return;
    directions.addWaypoint(coord);
    // setWaypoints((prev) => {
    //   const newWaypoints = [...prev, coord];
    //   directions.addWaypoint(coord, prev.length);
    //   return newWaypoints;
    // });
  }, []);

  const removeWaypoint = useCallback((index: number) => {
    const directions = directionsRef.current;
    if (!directions) return;

    setWaypoints((prev) => {
      const newWaypoints = prev.filter((_, i) => i !== index);
      directions.removeWaypoint(index);
      return newWaypoints;
    });
  }, []);

  const undoLastWaypoint = useCallback(() => {
    const directions = directionsRef.current;
    if (!directions || waypoints.length === 0) return;

    setWaypoints((prev) => {
      const newWaypoints = prev.slice(0, -1);

      if (newWaypoints.length === 0) {
        directions.clear();
      } else {
        directions.setWaypoints(newWaypoints);
      }

      return newWaypoints;
    });
  }, [waypoints.length]);

  // Clear all waypoints
  const clearWaypoints = useCallback(() => {
    const directions = directionsRef.current;
    if (!directions) return;

    directions.clear();
    setWaypoints([]);
    setRouteInfo(null);
  }, []);

  // 状態を復元（リロード時や編集モード用）
  const restoreState = useCallback((state: RouteState) => {
    const directions = directionsRef.current;
    if (!directions || state.waypoints.length === 0) return;

    directions.setWaypointsFeatures(state.waypoints);
    directions.setSnappointsFeatures(state.snappoints);
    directions.setRoutelinesFeatures(state.routelines);

    // waypointsのCoordinateを抽出
    const coords: Coordinate[] = state.waypoints
      .map((wp) => wp.geometry?.coordinates as Coordinate)
      .filter(Boolean);
    setWaypoints(coords);
  }, []);

  return {
    waypoints,
    routeInfo,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    undoLastWaypoint,
    restoreState,
    isReady,
  };
}
