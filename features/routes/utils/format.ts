export const formatDate = (date: string | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDistance = (distance: number | undefined): string => {
  if (!distance) return "0 km";
  if (distance < 1000) {
    return `${distance.toFixed(1)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
};

export const formatDuration = (duration: number | undefined): string => {
  if (!duration) return "0h 0m";
  const hours = Math.floor(duration / 3600);
  const minutes = Math.round((duration % 3600) / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
};
