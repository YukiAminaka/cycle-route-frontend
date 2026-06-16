const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

/**
 * Mapbox Static Images APIのURLを生成する
 *
 * @param polyline - Google Polyline形式のエンコードされたルート
 * @param options - 画像生成オプション
 * @returns Static Images APIのURL
 */
export function getMapboxStaticImageUrl(
  polyline: string,
  options: {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    padding?: number;
    style?: string;
  } = {}
): string {
  const token = validateToken();

  const {
    width = 400,
    height = 225,
    strokeColor = "3b82f6", // blue-500
    strokeOpacity = 1,
    strokeWidth = 3,
    padding = 50,
    style = "mapbox/outdoors-v12",
  } = options;

  // Polylineをパスオーバーレイとしてエンコード
  // 形式: path-{strokeWidth}+{strokeColor}({polyline})
  const encodedPolyline = encodeURIComponent(polyline);
  const pathOverlay = `path-${strokeWidth}+${strokeColor}-${strokeOpacity}(${encodedPolyline})`;

  // autoでルート全体が収まるように自動調整
  return `https://api.mapbox.com/styles/v1/${style}/static/${pathOverlay}/auto/${width}x${height}?padding=${padding}&access_token=${token}`;
}

/**
 * Validates that the Mapbox API token is available
 * @throws Error if token is missing
 */
function validateToken(): string {
  if (!MAPBOX_TOKEN) {
    throw new Error("NEXT_PUBLIC_MAPBOX_KEY is not configured");
  }
  return MAPBOX_TOKEN;
}

