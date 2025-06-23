import { CopyIcon, SaveIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { Marker, Popup, useMapEvent } from "react-leaflet";
import { memo, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { DragEndEvent, LeafletMouseEvent } from "leaflet";

import { convertLeafletToMinecraft } from "@/lib/map";

import type { Markers } from "@/hooks/use-markers";
import { useUrlCoordinates } from "@/hooks/use-url-coords";

import { Button } from "../ui/button";

import { isWithinMapBounds, removeUrlParams } from ".";

export interface MarkerData {
  id: number;
  leaflet: { lat: number; lng: number };
  minecraft: { x: number; z: number };
}

export const MapClickHandler = memo(function MapClickHandler({
  onAddMarker,
}: { onAddMarker: (marker: MarkerData) => void }) {
  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!isWithinMapBounds(lat, lng)) return;

      const newMarker = {
        id: Date.now(),
        leaflet: { lat, lng },
        minecraft: convertLeafletToMinecraft(lat, lng),
      };

      onAddMarker(newMarker);
    },
    [onAddMarker]
  );

  useMapEvent("click", handleMapClick);
  return null;
});

function MarkerPopup({
  marker,
  onSave,
  onRemove,
}: {
  marker: MarkerData;
  onSave: (markerId: number) => void;
  onRemove: (id: number) => void;
}) {
  const isUrlMarker = marker.id === -1;

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?x=${marker.minecraft.x}&z=${marker.minecraft.z}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied marker URL");
  }

  function handleCopyCoords(e: React.MouseEvent) {
    e.stopPropagation();

    const coords = `X ${marker.minecraft.x}, Z ${marker.minecraft.z}`;

    navigator.clipboard.writeText(coords);

    toast.success("Copied marker coordinates");
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    onSave(marker.id);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onRemove(marker.id);
  }

  return (
    <Popup className="box">
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
          onClick={handleSave}
          title="Store marker locally"
        >
          <SaveIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/10"
          onClick={handleRemove}
          title="Remove marker"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>
    </Popup>
  );
}

const MapMarker = memo(function MapMarker({
  marker,
  onMove,
  onSave,
  onRemove,
}: {
  marker: MarkerData;
  onMove: (id: number, lat: number, lng: number) => void;
  onSave: (markerId: number) => void;
  onRemove: (id: number) => void;
}) {
  const eventHandlers = useMemo(
    () => ({
      dragend: (e: DragEndEvent) => {
        const { lat, lng } = e.target.getLatLng();
        onMove(marker.id, lat, lng);
      },
    }),
    [onMove, marker.id]
  );

  const coords = `X ${marker.minecraft.x}, Z ${marker.minecraft.z}`;

  return (
    <Marker
      position={[marker.leaflet.lat, marker.leaflet.lng]}
      eventHandlers={eventHandlers}
      title={coords}
      draggable
    >
      <MarkerPopup
        marker={marker}
        onSave={onSave}
        onRemove={onRemove}
      />
    </Marker>
  );
});

export function MarkerLayer({
  markers,
  addMarker,
  removeMarker,
  moveMarker,
  saveMarkers,
}: {
  markers: Markers["markers"];
  addMarker: Markers["addMarker"];
  removeMarker: Markers["removeMarker"];
  moveMarker: Markers["moveMarker"];
  saveMarkers: Markers["saveMarkers"];
}) {
  const urlM = useUrlCoordinates();

  const allMarkers = useMemo(
    () => (urlM ? [...markers, urlM] : markers),
    [markers, urlM]
  );

  const handleMove = useCallback(
    (id: number, lat: number, lng: number) => {
      if (id === -1) return;
      moveMarker(id, lat, lng);
    },
    [moveMarker]
  );

  const handleRemove = useCallback(
    (id: number) => {
      if (id === -1) {
        const p = new URLSearchParams(window.location.search);
        removeUrlParams(p);
      } else {
        removeMarker(id);
      }
    },
    [removeMarker]
  );

  const handleSave = useCallback(
    (id: number) => {
      if (id === -1 && urlM) {
        addMarker({ ...urlM, id: Date.now() });
        saveMarkers();

        const p = new URLSearchParams(window.location.search);
        removeUrlParams(p);
      } else {
        saveMarkers();
      }
    },
    [addMarker, urlM, saveMarkers]
  );

  return (
    <>
      {allMarkers.map((m) => (
        <MapMarker
          key={m.id}
          marker={m}
          onMove={handleMove}
          onSave={handleSave}
          onRemove={handleRemove}
        />
      ))}
    </>
  );
}
