"use client";

import { getMapboxStaticPinImageUrl } from "@/services/mapbox";
import Image from "next/image";
import { useMemo } from "react";

type LocationSettingsProps = {
  location: string; // geojson point
};

const DEFAULT_LOCATION = { longitude: 139.753, latitude: 35.6844 };

export function LocationSettings({ location }: LocationSettingsProps) {
  const homeLocation = useMemo(() => {
    if (location) {
      try {
        const point = JSON.parse(location);
        return {
          longitude: point.coordinates[0] as number,
          latitude: point.coordinates[1] as number,
        };
      } catch {
        // fallback
      }
    }
    return DEFAULT_LOCATION;
  }, [location]);

  const mapImageUrl = getMapboxStaticPinImageUrl(
    homeLocation.longitude,
    homeLocation.latitude,
    { width: 736, height: 414 },
  );

  return (
    <div className="flex-1 p-8 max-w-200">
      <div>
        <h1 className="text-3xl font-medium mb-2">位置情報</h1>
        <p className="text-muted-foreground mb-8">
          ルートプランナーのデフォルトの位置を設定
        </p>
      </div>
      <div className="relative w-full aspect-video overflow-hidden border">
        <Image
          src={mapImageUrl}
          alt="デフォルトの位置プレビュー"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}
