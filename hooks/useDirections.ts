import { useEffect, useRef, useState, useCallback } from "react";
import MapLibreGlDirections, {
  LoadingIndicatorControl,
  MapLibreGlDirectionsRoutingEvent,
} from "@maplibre/maplibre-gl-directions";
import { Map as MapLibreMap } from "maplibre-gl";
import {
  LngLat,
  Cue,
  DirectionsResponse,
  DirectionsRoute,
} from "@/types/route";

interface UseDirectionsOptions {
  map: MapLibreMap | null | undefined;
  profile?: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling";
  onRouteChange?: (cues: Cue[]) => void;
}

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  elevationGain: number; // meters
  elevationLoss: number; // meters
  pathGeom: string; // GeoJSON geometry as string
  firstPoint: string; // GeoJSON point as string
  lastPoint: string; // GeoJSON point as string
}

interface UseDirectionsResult {
  waypoints: LngLat[];
  routeInfo: RouteInfo | null;
  addWaypoint: (coord: LngLat) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;
  undoLastWaypoint: () => void;
  isReady: boolean;
}

/**
 * Custom hook for managing MapLibre GL Directions
 * Handles waypoint management and route calculation
 */
export function useDirections({
  map,
  profile = "mapbox/cycling",
  onRouteChange,
}: UseDirectionsOptions): UseDirectionsResult {
  const directionsRef = useRef<MapLibreGlDirections | null>(null);
  const [waypoints, setWaypoints] = useState<LngLat[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Initialize directions plugin
  useEffect(() => {
    if (!map) return;

    const initDirections = () => {
      // Cleanup existing instance
      if (directionsRef.current) {
        directionsRef.current.destroy();
        directionsRef.current = null;
      }

      const directions = new MapLibreGlDirections(map, {
        api: "https://api.mapbox.com/directions/v5",
        profile,
        requestOptions: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          geometries: "geojson",
          steps: "true",
          alternatives: "true",
          overview: "full",
        },
      });

      directions.interactive = true;
      map.addControl(new LoadingIndicatorControl(directions));
      directionsRef.current = directions;
      setIsReady(true);

      const handleRouteEnd = (event: MapLibreGlDirectionsRoutingEvent) => {
        const response = event?.data as DirectionsResponse | undefined;
        const route: DirectionsRoute | undefined = response?.routes?.[0];

        if (!route) return;

        // Extract cue sheet from route steps
        const steps = (route.legs ?? []).flatMap((leg) => leg.steps ?? []);
        const cues: Cue[] = steps.map((step, index) => ({
          order: index,
          road: step.name ?? "",
          distance_m: step.distance ?? 0,
          duration_s: step.duration ?? 0,
          maneuver: {
            type: step.maneuver?.type,
            modifier: step.maneuver?.modifier,
            location: step.maneuver?.location,
          },
          geometry: step.geometry,
        }));

        // Calculate elevation gain and loss from steps
        let elevationGain = 0;
        let elevationLoss = 0;

        // Note: Mapbox Directions API doesn't directly provide elevation data in steps
        // You might need to use a separate elevation API or use the route's elevation data if available
        // For now, we'll set default values

        // Get first and last points from waypoints
        const coordinates = route.geometry?.coordinates ?? [];
        const firstPoint = coordinates[0];
        const lastPoint = coordinates[coordinates.length - 1];

        // Create route info
        const newRouteInfo: RouteInfo = {
          distance: route.distance ?? 0, // in meters
          duration: route.duration ?? 0, // in seconds
          elevationGain, // meters
          elevationLoss, // meters
          pathGeom: JSON.stringify(route.geometry), // GeoJSON LineString
          firstPoint: JSON.stringify({
            type: "Point",
            coordinates: firstPoint,
          }),
          lastPoint: JSON.stringify({
            type: "Point",
            coordinates: lastPoint,
          }),
        };

        setRouteInfo(newRouteInfo);

        if (onRouteChange) {
          onRouteChange(cues);
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
  }, [map, profile, onRouteChange]);

  const addWaypoint = useCallback((coord: LngLat) => {
    const directions = directionsRef.current;
    if (!directions) return;

    setWaypoints((prev) => {
      const newWaypoints = [...prev, coord];
      directions.addWaypoint(coord, prev.length);
      return newWaypoints;
    });
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

  return {
    waypoints,
    routeInfo,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    undoLastWaypoint,
    isReady,
  };
}
