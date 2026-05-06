import { Clock, MapPin, TrendingUp } from "lucide-react";

interface RouteCardProps {
  title: string;
  distance: string;
  elevation: string;
  duration: string;
  location: string;
  updateDate: string;
  imageUrl: string;
  mapThumbnail: string;
  userName: string;
  userAvatar: string;
  popularity?: string;
  badge?: string;
}

export function RouteCard({
  title,
  distance,
  elevation,
  duration,
  location,
  updateDate,
  imageUrl,
  mapThumbnail,
  userName,
  userAvatar,
  popularity,
  badge,
}: RouteCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer">
      {/* Header */}
      {badge && (
        <div className="bg-purple-600 text-white text-xs px-3 py-1 inline-block">
          {badge}
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>

        {/* Route Details */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            ルートの最終更新日：{updateDate}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-3">
          <span>{distance}</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {elevation}
          </span>
          <span>{duration}</span>
        </div>

        <div className="text-sm text-gray-600 mb-3">{location}</div>

        {popularity && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Clock className="w-4 h-4" />
            {popularity}
          </div>
        )}

        {/* Images */}
        <div className="flex gap-2 mb-3">
          <img
            src={mapThumbnail}
            alt="Map"
            className="w-20 h-20 rounded object-cover"
          />
          <div className="flex gap-1 flex-1">
            <img
              src={imageUrl}
              alt={title}
              className="flex-1 h-20 rounded object-cover"
            />
            <img
              src={imageUrl}
              alt={title}
              className="flex-1 h-20 rounded object-cover"
            />
            <img
              src={imageUrl}
              alt={title}
              className="flex-1 h-20 rounded object-cover"
            />
            <div className="w-12 h-20 rounded bg-gray-200 flex items-center justify-center text-xs">
              +2
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold">
            {userAvatar}
          </div>
          <span className="text-sm">{userName}</span>
        </div>
      </div>
    </div>
  );
}
