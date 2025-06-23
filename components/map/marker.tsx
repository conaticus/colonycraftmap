import { CopyIcon, InfoIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { Marker, Popup, Tooltip, useMapEvent } from "react-leaflet";
import { memo, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { DragEndEvent, LeafletMouseEvent } from "leaflet";

import { useUrlCoordinates } from "@/hooks/use-url-coords";

import { Button } from "../ui/button";
import { InlineEdit } from "../ui/inline-edit";

import { isWithinMapBounds, removeUrlParams } from ".";

export interface MarkerData {
  id: number;
  name: string;
  leaflet: { lat: number; lng: number };
  minecraft: { x: number; z: number };
}

export const MapClickHandler = memo(
  ({
    onAddMarker,
  }: { onAddMarker: (marker: MarkerData["leaflet"]) => void }) => {
    useMapEvent("click", (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!isWithinMapBounds(lat, lng)) return;

      onAddMarker({ lat, lng });
    });

    return null;
  }
);

function MarkerPopup({
  marker,
  onRemove,
  onRename,
}: {
  marker: MarkerData;
  onRemove: (id: number) => void;
  onRename: (markerId: number, newName: string) => void;
}) {
  const commonStop = useCallback((e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();

    fn();
  }, []);

  const copyUrl = useCallback(
    (e: React.MouseEvent) =>
      commonStop(e, () => {
        const url = `${window.location.origin}${window.location.pathname}?x=${marker.minecraft.x}&z=${marker.minecraft.z}`;

        navigator.clipboard.writeText(url);

        toast.success("Copied marker URL");
      }),
    [marker, commonStop]
  );

  const copyCoords = useCallback(
    (e: React.MouseEvent) =>
      commonStop(e, () => {
        const coords = `X ${marker.minecraft.x}, Z ${marker.minecraft.z}`;

        navigator.clipboard.writeText(coords);

        toast.success("Copied marker coordinates");
      }),
    [marker, commonStop]
  );

  const remove = useCallback(
    (e: React.MouseEvent) => commonStop(e, () => onRemove(marker.id)),
    [onRemove, marker.id, commonStop]
  );

  return (
    <Popup className="box">
      <div className="flex justify-between items-center gap-1">
        <span className="w-1/3 font-semibold inline-flex items-center gap-1.5">
          Name
          <span title="Tip: Click the name to edit it">
            <InfoIcon className="size-3.5" />
          </span>
        </span>
        <InlineEdit
          id={marker.id}
          name={marker.name}
          onRename={onRename}
        />
      </div>
      <div className="flex flex-col gap-1 tabular-nums">
        <div className="flex justify-between items-center gap-1">
          <span className="w-1/3 font-semibold">Coordinates</span>
          <span className="text-right text-xs text-muted-foreground">
            X {marker.minecraft.x}, Z {marker.minecraft.z}
          </span>
        </div>
      </div>
      <div className="flex gap-1 justify-end w-full border-t pt-2 mt-2">
        <Button
          title="Share marker coordinates as URL"
          variant="outline"
          size="icon"
          onClick={copyUrl}
        >
          <Share2Icon className="size-3.5" />
        </Button>
        <Button
          title="Copy coordinates"
          variant="outline"
          size="icon"
          onClick={copyCoords}
        >
          <CopyIcon className="size-3.5" />
        </Button>
        <Button
          className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/10"
          title="Remove marker"
          variant="outline"
          size="icon"
          onClick={(e) => {
            remove(e);

            if (marker.id === -1) {
              removeUrlParams(new URLSearchParams(window.location.search));
            }
          }}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>
    </Popup>
  );
}

const MapMarker = ({
  marker,
  showMarkerNames,
  onMove,
  onRemove,
  onRename,
}: {
  marker: MarkerData;
  showMarkerNames: boolean;
  onMove: (id: number, lat: number, lng: number) => void;
  onRemove: (id: number) => void;
  onRename: (id: number, name: string) => void;
}) => {
  const onDragEnd = useMemo(
    () =>
      ({ target }: DragEndEvent) => {
        const { lat, lng } = target.getLatLng();

        if (!isWithinMapBounds(lat, lng)) return;

        onMove(marker.id, lat, lng);
      },
    [marker.id, onMove]
  );

  return (
    <Marker
      title={`${marker.name}\nX ${marker.minecraft.x}, Z ${marker.minecraft.z}`}
      position={[marker.leaflet.lat, marker.leaflet.lng]}
      eventHandlers={{ dragend: onDragEnd }}
      draggable
    >
      <MarkerPopup
        marker={marker}
        onRemove={onRemove}
        onRename={onRename}
      />
      {showMarkerNames && (
        <Tooltip
          className="!bg-background/50 !p-1 !shadow-none !text-foreground !border-none before:!border-none !leading-none !text-[0.65rem] max-w-24 truncate"
          content={marker.name}
          position={[marker.leaflet.lat, marker.leaflet.lng]}
          direction="bottom"
          offset={[-14.5, 27.5]}
          key={[marker.id, marker.name].join("-")}
          permanent
        />
      )}
    </Marker>
  );
};

export function MarkerLayer({
  showMarkerNames,
  markers,
  addMarker,
  removeMarker,
  moveMarker,
  renameMarker,
}: {
  showMarkerNames: boolean;
  markers: MarkerData[];
  addMarker: (leaflet: MarkerData["leaflet"]) => void;
  removeMarker: (id: number) => void;
  moveMarker: (id: number, lat: number, lng: number) => void;
  renameMarker: (id: number, name: string) => void;
}) {
  const urlMarker = useUrlCoordinates();

  useEffect(() => {
    if (!urlMarker) return;

    addMarker(urlMarker.leaflet);
    removeUrlParams(new URLSearchParams(window.location.search));
  }, [urlMarker, addMarker]);

  const allMarkers = useMemo(
    () => (urlMarker ? [...markers, urlMarker] : markers),
    [markers, urlMarker]
  );

  const handleMove = useCallback(
    (id: number, lat: number, lng: number) => {
      if (id !== -1) moveMarker(id, lat, lng);
    },
    [moveMarker]
  );

  const handleRemove = useCallback(
    (id: number) => {
      if (id === -1) {
        removeUrlParams(new URLSearchParams(window.location.search));
      } else {
        removeMarker(id);
      }
    },
    [removeMarker]
  );

  return (
    <>
      {allMarkers.map((marker) => (
        <MapMarker
          marker={marker}
          showMarkerNames={showMarkerNames}
          onMove={handleMove}
          onRemove={handleRemove}
          onRename={renameMarker}
          key={`${marker.id}-${showMarkerNames}`} // Add showMarkerNames to key
        />
      ))}
    </>
  );
}
