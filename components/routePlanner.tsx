"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, { MapRef as MapLibreMapRef, useMap } from "react-map-gl/maplibre";

import { useDirections } from "@/hooks/useDirections";
import { useMapboxSearch } from "@/hooks/useMapboxSearch";
import { CoursePointRequest, WaypointRequest } from "@/types/api";
import { Coordinate } from "@/types/route";
import { ErrorBoundary } from "./error-boundary";
import { RouteCreationSidebar } from "./route-creation-sidebar";
import { RouteCreationToolbar } from "./route-creation-toolbar";

const TOKYO_STATION: Coordinate = [139.767, 35.681];
const INITIAL_VIEW = {
  longitude: 139.753,
  latitude: 35.6844,
  zoom: 14,
};

export const RoutePlanner = () => {
  const { map } = useMap();
  const nativeMap = map?.getMap();
  const mapRef = useRef<MapLibreMapRef>(null);

  // Component state
  const [routeName, setRouteName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [cues, setCues] = useState<CoursePointRequest[]>([]);

  // Mapbox search integration
  const {
    query, // 検索クエリ
    setQuery, // 検索クエリを更新する関数
    suggestions, // 検索候補のリスト
    isLoading: isSearchLoading, // 検索中かどうかのフラグ
    error: searchError, // 検索エラー情報
    pickSuggestion, // 検索候補を選択する関数
    clearSuggestions, // 検索候補をクリアする関数
  } = useMapboxSearch({
    proximity: TOKYO_STATION, // 東京駅を中心に検索
    country: "JP",
    language: "ja",
    debounceMs: 160, // デバウンス時間
  });

  // Directions management
  const {
    waypoints,
    routeInfo,
    addWaypoint,
    clearWaypoints,
    undoLastWaypoint,
  } = useDirections({
    map: nativeMap,
    onRouteChange: useCallback((newCues: CoursePointRequest[]) => {
      setCues(newCues);
    }, []),
  });

  // Convert waypoints to WaypointRequest format for API
  const waypointRequests: WaypointRequest[] = useMemo(
    () =>
      waypoints.map((coord) => ({
        location: JSON.stringify({ type: "Point", coordinates: coord }),
      })),
    [waypoints]
  );

  // Event handlers
  const handlePickSuggestion = useCallback(
    async (suggestion: {
      name: string;
      context: string;
      mapbox_id: string;
    }) => {
      const result = await pickSuggestion(suggestion);
      if (result?.coord) {
        addWaypoint(result.coord);
      }
    },
    [pickSuggestion, addWaypoint]
  );

  const handleClear = useCallback(() => {
    clearWaypoints();
    clearSuggestions();
    setQuery("");
    setCues([]);
  }, [clearWaypoints, clearSuggestions, setQuery]);

  const handleImport = useCallback(() => {
    console.log("Import not yet implemented");
    // TODO: Implement route import functionality
  }, []);

  // Render map style URL
  const mapStyle = useMemo(
    () =>
      `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
    []
  );

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full flex">
        <RouteCreationSidebar
          cue={cues}
          waypoints={waypointRequests}
          routeName={routeName}
          onRouteNameChange={setRouteName}
          onImport={handleImport}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
          routeInfo={routeInfo}
        />

        <Map
          ref={mapRef}
          id="map"
          initialViewState={INITIAL_VIEW}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
        />

        <RouteCreationToolbar
          onClear={handleClear}
          onUndo={undoLastWaypoint}
          onRedo={() => {
            // TODO: Implement redo functionality
          }}
          session={{ id: "", renew: () => {} }} // Managed internally by useMapboxSearch
          suggestions={suggestions}
          q={query}
          setQ={setQuery}
          pick={handlePickSuggestion}
          waypoints={waypoints}
          isCollapsed={isToolbarCollapsed}
          onCollapsedChange={setIsToolbarCollapsed}
        />

        {/* Display search errors */}
        {searchError && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md z-50">
            <strong className="font-bold">検索エラー: </strong>
            <span className="block sm:inline">{searchError.message}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isSearchLoading && (
          <div className="absolute top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50">
            検索中...
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
