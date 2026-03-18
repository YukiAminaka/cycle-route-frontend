import { getMapboxStaticImageUrl } from "@/services/mapbox";
import { RouteResponseModel } from "@/types/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate, formatDistance, formatDuration } from "../utils/format";

interface RouteCardProps {
  route: RouteResponseModel;
}

export function RouteCard({ route }: RouteCardProps) {
  const router = useRouter();
  const categoryColor = "bg-[#4EAFA6]";

  return (
    <div
      className="flex gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer max-w-2xl"
      onClick={() => route.id && router.push(`/routes/${route.id}`)}
    >
      <div className="flex-1">
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-lg font-bold">{route.name}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
          <span>{formatDistance(route.distance)}</span>
          {route.elevation_gain != undefined && (
            <span>{route.elevation_gain}m</span>
          )}
          {route.duration && <span>{formatDuration(route.duration)}</span>}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`${categoryColor} text-white text-xs px-3 py-1 rounded`}
          >
            {"ルート"}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(route.created_at)}
          </span>
        </div>
      </div>

      <div className="relative w-24 h-24 shrink-0">
        {route.polyline ? (
          <Image
            src={getMapboxStaticImageUrl(route.polyline, {
              strokeColor: "F52738",
              strokeWidth: 3,
              style: "mapbox/streets-v12",
              width: 409,
              height: 230,
            })}
            alt={route.name ?? "ルートプレビュー"}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}
      </div>
    </div>
  );
}
