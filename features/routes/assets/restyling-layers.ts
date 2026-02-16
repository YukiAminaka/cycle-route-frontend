import type { LayerSpecification } from "maplibre-gl";

export const layers = [
  // 1. スナップライン（点線）
  {
    id: "maplibre-gl-directions-snapline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-dasharray": [1],
      "line-color": "#888888",
      "line-opacity": 0.65,
      "line-width": 2,
    },
    filter: ["==", ["get", "type"], "SNAPLINE"],
  },

  // 2. 代替ルートライン（画像パターンを使わずグレーの実線で表現）
  {
    id: "maplibre-gl-directions-alt-routeline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#777777", // グレー
      "line-width": 8,
      "line-opacity": 0.5,
    },
    filter: ["==", ["get", "route"], "ALT"],
  },

  // 3. 選択されたルートライン（画像パターンを使わず青色の実線で表現）
  {
    id: "maplibre-gl-directions-routeline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#3887be", // 青色
      "line-width": 8,
      "line-opacity": 0.8,
    },
    filter: ["==", ["get", "route"], "SELECTED"],
  },

  // 4. ホバーポイント（アイコンの代わりに円を表示）
  {
    id: "maplibre-gl-directions-hoverpoint",
    type: "circle",
    source: "maplibre-gl-directions",
    paint: {
      "circle-radius": 10,
      "circle-color": "#FF0000", // 赤色
      "circle-opacity": 0.5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#FFFFFF",
    },
    filter: ["==", ["get", "type"], "HOVERPOINT"],
  },

  // 5. スナップポイント（アイコンの代わりに円を表示）
  {
    id: "maplibre-gl-directions-snappoint",
    type: "circle",
    source: "maplibre-gl-directions",
    paint: {
      "circle-radius": 8,
      "circle-color": "#F89C1C", // オレンジ色
      "circle-stroke-width": 2,
      "circle-stroke-color": "#FFFFFF",
    },
    filter: ["==", ["get", "type"], "SNAPPOINT"],
  },

  // 6. ウェイポイント（アイコンの代わりに円を表示）
  {
    id: "maplibre-gl-directions-waypoint",
    type: "circle",
    source: "maplibre-gl-directions",
    paint: {
      "circle-radius": 12,
      "circle-color": "#3887be", // 青色
      "circle-stroke-width": 3,
      "circle-stroke-color": "#FFFFFF",
    },
    filter: ["==", ["get", "type"], "WAYPOINT"],
  },
] as LayerSpecification[];
