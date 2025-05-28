"use client";

import {
  MapContainer,
  TileLayer,
  useMapEvent,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SaveIcon, Trash2Icon, Share2Icon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import "leaflet/dist/leaflet.css";

import { Button } from "./ui/button";

// fix for default markers in react-leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MarkerData {
  id: number;
  leaflet: { lat: number; lng: number };
  minecraft: { x: number; z: number };
}

interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

interface MapClickHandlerProps extends CoordinateConfig {
  onAddMarker: (marker: MarkerData) => void;
}

interface MarkerPopupProps {
  marker: MarkerData;
  onSave: (markerId: number) => void;
  onRemove: (id: number) => void;
}

const MAP_CONFIG = {
  MAX_ZOOM_DISPLAY: 8,
  IMAGE_WIDTH: 12288,
  IMAGE_HEIGHT: 6144,
  SCALE_FACTOR_FROM_ORIGINAL_TO_CRS_UNITS_AT_Z0: 64,
} as const;

const TRANSPARENT_TILE_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function calculateMapDimensions() {
  const effectiveWidth =
    MAP_CONFIG.IMAGE_WIDTH /
    MAP_CONFIG.SCALE_FACTOR_FROM_ORIGINAL_TO_CRS_UNITS_AT_Z0;
  const effectiveHeight =
    MAP_CONFIG.IMAGE_HEIGHT /
    MAP_CONFIG.SCALE_FACTOR_FROM_ORIGINAL_TO_CRS_UNITS_AT_Z0;

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

function isWithinMapBounds(lat: number, lng: number): boolean {
  const { effectiveWidth, effectiveHeight } = calculateMapDimensions();

  return (
    lat >= -effectiveHeight && lat <= 0 && lng >= 0 && lng <= effectiveWidth
  );
}

function createCoordinateConfig(): CoordinateConfig {
  const { effectiveWidth, effectiveHeight } = calculateMapDimensions();

  return {
    blocksPerLeafletUnit:
      MAP_CONFIG.SCALE_FACTOR_FROM_ORIGINAL_TO_CRS_UNITS_AT_Z0,
    leafletOriginLngForMinecraftZero: effectiveWidth / 2,
    leafletOriginLatForMinecraftZero: -effectiveHeight / 2,
  };
}

function convertMinecraftToLeaflet(
  x: number,
  z: number,
  config: CoordinateConfig
): { lat: number; lng: number } {
  return {
    lat:
      config.leafletOriginLatForMinecraftZero - z / config.blocksPerLeafletUnit,
    lng:
      config.leafletOriginLngForMinecraftZero + x / config.blocksPerLeafletUnit,
  };
}

function convertLeafletToMinecraft(
  lat: number,
  lng: number,
  config: CoordinateConfig
): { x: number; z: number } {
  return {
    x: Math.round(
      (lng - config.leafletOriginLngForMinecraftZero) *
        config.blocksPerLeafletUnit
    ),
    z: Math.round(
      (config.leafletOriginLatForMinecraftZero - lat) *
        config.blocksPerLeafletUnit
    ),
  };
}

function CoordinatesDisplay(props: CoordinateConfig) {
  const {
    leafletOriginLngForMinecraftZero,
    leafletOriginLatForMinecraftZero,
    blocksPerLeafletUnit,
  } = props;
  const [coords, setCoords] = useState({
    leaflet: { lat: 0, lng: 0 },
    minecraft: { x: 0, z: 0 },
  });

  useMapEvent("mousemove", (e) => {
    const { lat, lng } = e.latlng;
    const minecraft = convertLeafletToMinecraft(lat, lng, {
      leafletOriginLngForMinecraftZero,
      leafletOriginLatForMinecraftZero,
      blocksPerLeafletUnit,
    });

    setCoords({ leaflet: { lat, lng }, minecraft });
  });

  return (
    <div className="leaflet-bar absolute bottom-2.5 left-2.5 z-[1000] min-w-44 tabular-nums">
      <div className="p-2 shadow-md text-sm flex flex-col">
        <span>
          X {coords.minecraft.x}, Z {coords.minecraft.z}
        </span>
        <span className="italic text-muted-foreground">
          Lat {coords.leaflet.lat.toFixed(3)}, Lng{" "}
          {coords.leaflet.lng.toFixed(3)}
        </span>
      </div>
    </div>
  );
}

function MapClickHandler(props: MapClickHandlerProps) {
  const {
    leafletOriginLngForMinecraftZero,
    leafletOriginLatForMinecraftZero,
    blocksPerLeafletUnit,
    onAddMarker,
  } = props;

  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;

    // don't add marker if outside bounds
    if (!isWithinMapBounds(lat, lng)) return;

    const newMarker = {
      id: Date.now(),
      leaflet: { lat, lng },
      minecraft: convertLeafletToMinecraft(lat, lng, {
        leafletOriginLngForMinecraftZero,
        leafletOriginLatForMinecraftZero,
        blocksPerLeafletUnit,
      }),
    };

    onAddMarker(newMarker);
  });

  return null;
}

function MarkerPopup(props: MarkerPopupProps) {
  const { marker, onSave, onRemove } = props;

  const isUrlMarker = marker.id === -1;

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();

    const url = `${window.location.origin}${window.location.pathname}?x=${marker.minecraft.x}&z=${marker.minecraft.z}`;

    /* window.history.replaceState(
      {},
      "",
      `?x=${marker.minecraft.x}&z=${marker.minecraft.z}`
    ); */

    navigator.clipboard.writeText(url);

    toast.success("Copied marker URL");
  }

  function handleCopyCoords(e: React.MouseEvent) {
    e.stopPropagation();

    const coords = `X ${marker.minecraft.x}, Z ${marker.minecraft.z}`;

    navigator.clipboard.writeText(coords);

    toast.success("Copied marker coordinates");
  }

  return (
    <Popup>
      <div className="flex flex-col gap-1 tabular-nums">
        <div className="flex justify-between items-center gap-1">
          <span className="w-1/3 font-semibold">Minecraft</span>
          <span className="text-right text-xs text-muted-foreground">
            X {marker.minecraft.x}, Z {marker.minecraft.z}
          </span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="w-1/3 font-semibold">Map</span>
          <span className="text-right text-xs text-muted-foreground">
            Lat {marker.leaflet.lat.toFixed(3)}, Lng{" "}
            {marker.leaflet.lng.toFixed(3)}
          </span>
        </div>
        {isUrlMarker && (
          <span className="text-xs text-muted-foreground">
            (added from url parameters)
          </span>
        )}
      </div>
      <div className="flex gap-1 justify-end w-full border-t pt-2 mt-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          title="Share marker minecraft coordinates as URL"
        >
          <Share2Icon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyCoords}
          title="Copy minecraft coordinates"
        >
          <CopyIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onSave(marker.id);
          }}
          title="Store marker locally"
        >
          <SaveIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(marker.id);
          }}
          title="Remove marker"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>
    </Popup>
  );
}

function MapMarker(props: {
  marker: MarkerData;
  config: CoordinateConfig;
  onMove: (id: number, lat: number, lng: number) => void;
  onSave: (markerId: number) => void;
  onRemove: (id: number) => void;
}) {
  const { marker, onMove, onSave, onRemove } = props;

  return (
    <Marker
      key={marker.id}
      position={[marker.leaflet.lat, marker.leaflet.lng]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMove(marker.id, lat, lng);
        },
      }}
    >
      <MarkerPopup
        marker={marker}
        onSave={onSave}
        onRemove={onRemove}
      />
    </Marker>
  );
}

function useMarkers() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("markers");

    if (stored) setMarkers(JSON.parse(stored));
  }, []);

  function addMarker(marker: MarkerData) {
    setMarkers((prev) => [...prev, marker]);
  }

  function removeMarker(markerId: number) {
    setMarkers((prev) => {
      const u = prev.filter((m) => m.id !== markerId);
      localStorage.setItem("markers", JSON.stringify(u));
      return u;
    });

    toast.success("Deleted marker");
  }

  function moveMarker(
    markerId: number,
    newLat: number,
    newLng: number,
    config: CoordinateConfig
  ) {
    if (!isWithinMapBounds(newLat, newLng)) return;

    const minecraft = convertLeafletToMinecraft(newLat, newLng, config);

    setMarkers((prev) =>
      prev.map((m) =>
        m.id === markerId
          ? { ...m, leaflet: { lat: newLat, lng: newLng }, minecraft }
          : m
      )
    );
  }

  function saveMarkers() {
    localStorage.setItem("markers", JSON.stringify(markers));

    toast.success("Saved marker");
  }

  return {
    markers,
    addMarker,
    removeMarker,
    moveMarker,
    saveMarkers,
    setMarkers,
  };
}

function useUrlCoordinates(config: CoordinateConfig) {
  const searchParams = useSearchParams();
  const map = useMap();
  const [urlMarker, setUrlMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    const x = searchParams.get("x");
    const z = searchParams.get("z");

    if (x !== null && z !== null) {
      const xi = Number.parseInt(x, 10);
      const zi = Number.parseInt(z, 10);

      if (!Number.isNaN(xi) && !Number.isNaN(zi)) {
        const lf = convertMinecraftToLeaflet(xi, zi, config);

        if (isWithinMapBounds(lf.lat, lf.lng)) {
          setUrlMarker({
            id: -1,
            leaflet: lf,
            minecraft: { x: xi, z: zi },
          });

          map.flyTo(lf, 6, {
            duration: 1.5,
          });
        } else {
          removeUrlParams(searchParams);
        }
      } else {
        removeUrlParams(searchParams);
      }
    } else setUrlMarker(null);
  }, [searchParams, config, map.flyTo]);

  return urlMarker;
}

function removeUrlParams(searchParams: URLSearchParams) {
  searchParams.delete("x");
  searchParams.delete("z");

  const nu = searchParams.toString()
    ? `?${searchParams.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, "", nu);
}

function MarkerLayer({
  config,
  markers,
  addMarker,
  removeMarker,
  moveMarker,
  saveMarkers,
}: {
  config: CoordinateConfig;
  markers: ReturnType<typeof useMarkers>["markers"];
  addMarker: ReturnType<typeof useMarkers>["addMarker"];
  removeMarker: ReturnType<typeof useMarkers>["removeMarker"];
  moveMarker: ReturnType<typeof useMarkers>["moveMarker"];
  saveMarkers: ReturnType<typeof useMarkers>["saveMarkers"];
}) {
  const urlM = useUrlCoordinates(config);

  const all = urlM ? [...markers, urlM] : markers;

  function hm(id: number, lat: number, lng: number) {
    if (id === -1) return;

    moveMarker(id, lat, lng, config);
  }

  function hr(id: number) {
    if (id === -1) {
      const p = new URLSearchParams(window.location.search);
      removeUrlParams(p);
    } else {
      removeMarker(id);
    }
  }

  function hs(id: number) {
    if (id === -1 && urlM) {
      addMarker({ ...urlM, id: Date.now() });
      saveMarkers();

      const p = new URLSearchParams(window.location.search);

      removeUrlParams(p);
    } else {
      saveMarkers();
    }
  }

  return (
    <>
      {all.map((m) => (
        <MapMarker
          key={m.id}
          marker={m}
          config={config}
          onMove={hm}
          onSave={hs}
          onRemove={hr}
        />
      ))}
    </>
  );
}

export default function EarthMap() {
  const dims = calculateMapDimensions();

  const config = useMemo(() => createCoordinateConfig(), []);

  const { markers, addMarker, removeMarker, moveMarker, saveMarkers } =
    useMarkers();

  return (
    <MapContainer
      className="size-full min-h-screen w-screen [&>*]:!font-sans bg-background"
      center={dims.center}
      zoom={3}
      minZoom={0}
      maxZoom={MAP_CONFIG.MAX_ZOOM_DISPLAY}
      crs={L.CRS.Simple}
      bounds={dims.bounds}
      maxBounds={dims.bounds}
    >
      <TileLayer
        attribution='Map data &copy; <a href="https://earth.motfe.net/" target="_blank">Minecraft Earth map</a>, <a href="https://colonycraft.org/" target="_blank">Colony Craft</a>, Generated using <a href="https://github.com/itsbrunodev/tilegen" target="_blank">tilegen</a>'
        url="/tiles/{z}/{x}/{y}.png"
        errorTileUrl={TRANSPARENT_TILE_BASE64}
        bounds={dims.bounds}
        noWrap
        tms
      />
      <CoordinatesDisplay {...config} />
      <MapClickHandler
        {...config}
        onAddMarker={addMarker}
      />
      <MarkerLayer
        config={config}
        {...{ markers, addMarker, removeMarker, moveMarker, saveMarkers }}
      />
    </MapContainer>
  );
}
