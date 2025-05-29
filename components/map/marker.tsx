import { CopyIcon, SaveIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { Marker, Popup, useMapEvent } from "react-leaflet";
import { toast } from "sonner";

import type { Markers } from "@/hooks/use-markers";
import { useUrlCoordinates } from "@/hooks/use-url-coords";

import { Button } from "../ui/button";

import { convertLeafletToMinecraft, type CoordinateConfig } from "./coords";

import { isWithinMapBounds, removeUrlParams } from ".";

export interface MarkerData {
  id: number;
  leaflet: { lat: number; lng: number };
  minecraft: { x: number; z: number };
}

export function MapClickHandler({
  config,
  onAddMarker,
}: { config: CoordinateConfig; onAddMarker: (marker: MarkerData) => void }) {
  const {
    leafletOriginLngForMinecraftZero,
    leafletOriginLatForMinecraftZero,
    blocksPerLeafletUnit,
  } = config;

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

function MarkerPopup(props: {
  marker: MarkerData;
  onSave: (markerId: number) => void;
  onRemove: (id: number) => void;
}) {
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
          <span className="w-1/3 font-semibold">Coordinates</span>
          <span className="text-right text-xs text-muted-foreground">
            X {marker.minecraft.x}, Z {marker.minecraft.z}
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
          title="Share marker coordinates as URL"
        >
          <Share2Icon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyCoords}
          title="Copy coordinates"
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

export function MarkerLayer({
  config,
  markers,
  addMarker,
  removeMarker,
  moveMarker,
  saveMarkers,
}: {
  config: CoordinateConfig;
  markers: Markers["markers"];
  addMarker: Markers["addMarker"];
  removeMarker: Markers["removeMarker"];
  moveMarker: Markers["moveMarker"];
  saveMarkers: Markers["saveMarkers"];
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
