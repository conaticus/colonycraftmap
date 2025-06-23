"use client";

import { MapContainer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useMarkers } from "@/hooks/use-markers";

import { tileUrl } from "@/lib/utils";
import { calculateMapDimensions } from "@/lib/map";

import { MAP_CONFIG } from "@/constants/map";

import { Coordinates } from "./coords";
import { MapClickHandler, MarkerLayer } from "./marker";
import { CustomTileLayer } from "./tiles";
import { OreLayers } from "./ores";
import { Usage } from "./usage";
// import { ColoniesLayer } from "./colonies";

// fix for default markers in react-leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-2x.png",
  iconUrl: "/marker.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

function Placeholder() {
  return (
    <p>
      Map of Colony Craft
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </p>
  );
}

export default function EarthMap() {
  const dims = calculateMapDimensions();

  const { markers, addMarker, removeMarker, moveMarker, saveMarkers } =
    useMarkers();

  return (
    <div className="fixed size-full">
      <MapContainer
        className="size-full [&>*]:!font-sans relative"
        placeholder={<Placeholder />}
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
        <Usage />
        <Coordinates addMarker={addMarker} />
        <OreLayers dims={dims} />
        <MapClickHandler onAddMarker={addMarker} />
        <MarkerLayer
          {...{ markers, addMarker, removeMarker, moveMarker, saveMarkers }}
        />
        {/* <ColoniesLayer /> */}
      </MapContainer>
    </div>
  );
}
