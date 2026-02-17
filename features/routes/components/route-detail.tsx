"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RouteResponseModel } from "@/types/api";
import {
  Bike,
  Clock,
  Download,
  FileJson,
  Map as MapIcon,
  Mountain,
  Pencil,
  TrendingDown,
} from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Map, { Layer, MapProvider, Source } from "react-map-gl/maplibre";

interface RouteDetailProps {
  route: RouteResponseModel;
}

export default function RouteDetail({ route }: RouteDetailProps) {
  const router = useRouter();
  const mapStyle = useMemo(
    () =>
      `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
    []
  );

  // path_geomからGeoJSONを取得
  const routeGeoJson = useMemo(() => {
    if (!route.path_geom) return null;
    try {
      return JSON.parse(route.path_geom);
    } catch {
      return null;
    }
  }, [route.path_geom]);

  // 初期表示位置を計算（first_pointから取得）
  const initialViewState = useMemo(() => {
    if (route.first_point) {
      try {
        const point = JSON.parse(route.first_point);
        return {
          longitude: point.coordinates[0],
          latitude: point.coordinates[1],
          zoom: 12,
        };
      } catch {
        // fallback
      }
    }
    // デフォルト（東京）
    return {
      longitude: 139.753,
      latitude: 35.6844,
      zoom: 12,
    };
  }, [route.first_point]);

  const formatDistance = (distance: number | undefined) => {
    if (!distance) return "0 km";
    if (distance < 1000) {
      return `${distance.toFixed(0)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return "0h 0m";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.round((duration % 3600) / 60);
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    const routeId = route.id;
    if (routeId) {
      router.push(`/routes/${routeId}/edit`);
    }
  };

  return (
    <MapProvider>
      <div className="relative h-full w-full flex">
        {/* サイドバー - ルート情報 */}
        <div className="w-80 bg-background border-r p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-2">
            {route.name || "無題のルート"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {formatDate(route.created_at)}
          </p>

          {route.description && (
            <p className="text-sm text-muted-foreground mb-6">
              {route.description}
            </p>
          )}

          {/* 編集ボタン */}
          <div className="flex mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="ml-auto gap-2"
            >
              <Pencil className="h-4 w-4" />
              編集
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                  <Download className="h-4 w-4" />
                  エクスポート
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <MapIcon className="h-4 w-4" />
                  GPX形式
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <FileJson className="h-4 w-4" />
                  GeoJSON形式
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bike className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">距離</p>
                <p className="font-semibold">
                  {formatDistance(route.distance)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">所要時間</p>
                <p className="font-semibold">
                  {formatDuration(route.duration)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mountain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">獲得標高</p>
                <p className="font-semibold">{route.elevation_gain ?? 0} m</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">標高減少</p>
                <p className="font-semibold">{route.elevation_loss ?? 0} m</p>
              </div>
            </div>
          </div>
        </div>

        {/* 地図 */}
        <div className="flex-1 relative">
          <Map
            id="route-detail-map"
            initialViewState={initialViewState}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyle}
          >
            {routeGeoJson && (
              <Source id="route" type="geojson" data={routeGeoJson}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#3b82f6",
                    "line-width": 4,
                    "line-opacity": 0.8,
                  }}
                />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </MapProvider>
  );
}
