"use client";

import { MapContainer } from "react-leaflet";
import L from "leaflet";
import Control from "react-leaflet-custom-control";

import "leaflet/dist/leaflet.css";

import { useMarkers } from "@/hooks/use-markers";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { tileUrl } from "@/lib/utils";
import type { Settings as SettingsType } from "@/lib/types";
import { calculateMapDimensions } from "@/lib/map";

import { MAP_CONFIG } from "@/constants/map";

import { Coordinates } from "./coords";
import { MapClickHandler, MarkerLayer } from "./marker";
import { CustomTileLayer } from "./tiles";
import { OreLayers } from "./ores";
import { Usage } from "./usage";
import { Settings } from "./settings";
import { Players } from "./players";
import { InitialPositionHandler } from "./initial-position";
import { TransportationLayer } from "./transportation";
import { ColoniesLayer } from "./colonies";

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

  const [settings, setSettings] = useLocalStorage<SettingsType>("settings", {
    showMarkerNames: true,
    showTransportation: true,
    showColonies: true,
  });

  const {
    markers,
    addMarker,
    moveMarker,
    renameMarker,
    removeMarker,
    removeMarkers,
  } = useMarkers();

  return (
    <div className="fixed inset-0">
      <MapContainer
        className="w-full h-full [&>*]:!font-sans relative"
        placeholder={<Placeholder />}
        center={dims.center as [number, number]}
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
        keyboard
      >
        <Control
          container={{
            className: "flex flex-col gap-2.5",
            style: { background: "none" },
          }}
          position="bottomright"
          prepend
        >
          <Usage />
          <Settings
            markersLength={markers.length}
            settings={settings}
            setSettings={setSettings}
            removeMarkers={removeMarkers}
          />
        </Control>
        <Control
          container={{
            className: "flex flex-col gap-2.5",
            style: { background: "none" },
          }}
          position="bottomleft"
        >
          <Players />
          <Coordinates addMarker={addMarker} />
        </Control>
        <ColoniesLayer showColonies={settings.showColonies} />
        <TransportationLayer showTransportation={settings.showTransportation} />
        <CustomTileLayer url={tileUrl("earth")} dims={dims} withAttribution />
        <OreLayers dims={dims} />
        <InitialPositionHandler />
        <MapClickHandler onAddMarker={addMarker} />
        <MarkerLayer
          showMarkerNames={settings.showMarkerNames}
          markers={markers}
          addMarker={addMarker}
          removeMarker={removeMarker}
          moveMarker={moveMarker}
          renameMarker={renameMarker}
        />
      </MapContainer>
    </div>
  );
}
