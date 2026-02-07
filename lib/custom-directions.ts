import type {
  Feature,
  LineString,
  MapLibreGlDirectionsConfiguration,
  Point,
} from "@maplibre/maplibre-gl-directions";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import { MapLibreGlDirectionsNonCancelableEvent } from "@maplibre/maplibre-gl-directions/dist/src/directions/events";
import type maplibregl from "maplibre-gl";

/**
 * routelines は、計算されたルートの線（LineString）です。
 * snappoint は、ルーティングプロバイダ（OSRM / Mapbox Directions互換API）が返す 「道路上に吸着された座標」です。
 * waypoint は、ユーザーが地図上で指定した経由地（出発・到着・途中の点）そのものです。
 */

export default class CustomMapLibreGlDirections extends MapLibreGlDirections {
  constructor(
    map: maplibregl.Map,
    configuration?: Partial<MapLibreGlDirectionsConfiguration>
  ) {
    super(map, configuration);
  }

  // augmented public interface

  get waypointsFeatures() {
    return this._waypoints;
  }

  setWaypointsFeatures(waypointsFeatures: Feature<Point>[]) {
    this._waypoints = waypointsFeatures;

    this.assignWaypointsCategories();

    const waypointEvent = new MapLibreGlDirectionsNonCancelableEvent(
      "setwaypoints",
      undefined,
      {}
    );
    this.fire(waypointEvent);

    this.draw();
  }

  get snappointsFeatures() {
    return this.snappoints;
  }

  setSnappointsFeatures(snappointsFeatures: Feature<Point>[]) {
    this.snappoints = snappointsFeatures;
    this.draw();
  }

  get routelinesFeatures() {
    return this.routelines;
  }

  setRoutelinesFeatures(routelinesFeatures: Feature<LineString>[][]) {
    this.routelines = routelinesFeatures;
    this.draw();
  }
}
