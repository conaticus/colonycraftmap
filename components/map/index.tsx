"use client";

import { MapContainer } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

import "leaflet/dist/leaflet.css";

import { useMarkers } from "@/hooks/use-markers";

import { tileUrl } from "@/lib/utils";

import { MAP_CONFIG } from "@/constants/map";

import { Coordinates, createCoordinateConfig } from "./coords";
import { MapClickHandler, MarkerLayer } from "./marker";
import { CustomTileLayer } from "./tiles";
import { OreLayers } from "./ores";

// fix for default markers in react-leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function calculateMapDimensions() {
  const effectiveWidth =
    MAP_CONFIG.IMAGE_WIDTH / MAP_CONFIG.BLOCKS_PER_CRS_UNIT_AT_MAX_ZOOM;
  const effectiveHeight =
    MAP_CONFIG.IMAGE_HEIGHT / MAP_CONFIG.BLOCKS_PER_CRS_UNIT_AT_MAX_ZOOM;

  return {
    effectiveWidth,
    effectiveHeight,
    bounds: [
      [-effectiveHeight, 0],
      [0, effectiveWidth],
    ] as L.LatLngBoundsExpression,
    center: [-effectiveHeight / 2, effectiveWidth / 2] as L.LatLngExpression,
  };
}

export function isWithinMapBounds(lat: number, lng: number): boolean {
  const { effectiveWidth, effectiveHeight } = calculateMapDimensions();

  return (
    lat >= -effectiveHeight && lat <= 0 && lng >= 0 && lng <= effectiveWidth
  );
}

export function removeUrlParams(searchParams: URLSearchParams) {
  searchParams.delete("x");
  searchParams.delete("z");

  const nu = searchParams.toString()
    ? `?${searchParams.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, "", nu);
}

export default function EarthMap() {
  const dims = calculateMapDimensions();

  const config = useMemo(() => createCoordinateConfig(), []);

  const { markers, addMarker, removeMarker, moveMarker, saveMarkers } =
    useMarkers();

  return (
    <MapContainer
      className="size-full min-h-screen w-screen [&>*]:!font-sans relative"
      center={dims.center}
      zoom={3}
      minZoom={0}
      maxZoom={MAP_CONFIG.MAX_ZOOM}
      crs={L.CRS.Simple}
      bounds={dims.bounds}
      maxBounds={dims.bounds}
      zoomSnap={1}
      zoomDelta={1}
      wheelPxPerZoomLevel={120}
      preferCanvas
    >
      <CustomTileLayer
        url={tileUrl("earth")}
        dims={dims}
        withAttribution
      />
      <Coordinates
        config={config}
        addMarker={addMarker}
      />
      <OreLayers dims={dims} />
      <MapClickHandler
        config={config}
        onAddMarker={addMarker}
      />
      <MarkerLayer
        config={config}
        {...{ markers, addMarker, removeMarker, moveMarker, saveMarkers }}
      />
    </MapContainer>
  );
}
