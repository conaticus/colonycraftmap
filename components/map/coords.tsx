import { useState, useCallback, memo } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import Control from "react-leaflet-custom-control";
import { CrosshairIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { LeafletMouseEvent } from "leaflet";

import type { useMarkers } from "@/hooks/use-markers";

import {
  convertLeafletToMinecraft,
  convertMinecraftToLeaflet,
} from "@/lib/map";

import { MAP_CONFIG } from "@/constants/map";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import type { MarkerData } from "./marker";

function CoordinatesInput({
  addMarker,
}: {
  addMarker: (leaflet: MarkerData["leaflet"]) => void;
}) {
  const map = useMap();

  const [coords, setCoords] = useState({ x: "", z: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;

    const max =
      id === "x"
        ? MAP_CONFIG.IMAGE_WIDTH / 2
        : id === "z"
          ? MAP_CONFIG.IMAGE_HEIGHT / 2
          : Number.POSITIVE_INFINITY;

    if (
      value === "" ||
      value === "-" ||
      (/^-?\d+$/.test(value) && Math.abs(Number(value)) <= max)
    ) {
      setCoords({ ...coords, [id]: value });
    }
  }

  const x = Number.parseInt(coords.x);
  const z = Number.parseInt(coords.z);

  const isValidCoords = !Number.isNaN(x) && !Number.isNaN(z);

  function locateCoords() {
    if (isValidCoords) {
      const lf = convertMinecraftToLeaflet(x, z);

      addMarker(lf);

      map.flyTo(lf, 6, {
        duration: 1.5,
      });
    } else {
      toast.error("Invalid coordinates");
    }
  }

  return (
    <div className="text-sm flex flex-col gap-2 p-2 border-b border-b-border">
      <span className="font-medium">Locate coordinates</span>
      <div className="flex [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&>div>label]:text-xs [&>div>label]:text-muted-foreground gap-2">
        <div>
          <label htmlFor="x">X</label>
          <Input
            id="x"
            value={coords.x}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && locateCoords()}
          />
        </div>
        <div>
          <label htmlFor="z">Z</label>
          <Input
            id="z"
            value={coords.z}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && locateCoords()}
          />
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <Button
          className="flex-1"
          title="Locate coordinates on map"
          variant="default"
          size="xs"
          disabled={!isValidCoords}
          onClick={locateCoords}
        >
          <CrosshairIcon className="size-3" />
          Locate
        </Button>
        <Button
          className="size-7"
          title="Clear coordinates"
          variant="secondary"
          size="xs"
          disabled={!isValidCoords}
          onClick={() => setCoords({ x: "", z: "" })}
        >
          <XIcon className="size-3" />
        </Button>
      </div>
    </div>
  );
}

const CoordinatesDisplay = memo(function CoordinatesDisplay() {
  const [coords, setCoords] = useState({
    leaflet: { lat: 0, lng: 0 },
    minecraft: { x: 0, z: 0 },
  });

  const handleMouseMove = useCallback((e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const minecraft = convertLeafletToMinecraft(lat, lng);

    if (
      Math.abs(minecraft.x) <= MAP_CONFIG.IMAGE_WIDTH / 2 &&
      Math.abs(minecraft.z) <= MAP_CONFIG.IMAGE_HEIGHT / 2
    ) {
      setCoords({ leaflet: { lat, lng }, minecraft });
    }
  }, []);

  useMapEvent("mousemove", handleMouseMove);

  return (
    <span className="text-sm p-2">
      X {coords.minecraft.x}, Z {coords.minecraft.z}
    </span>
  );
});

export function Coordinates({
  addMarker,
}: {
  addMarker: ReturnType<typeof useMarkers>["addMarker"];
}) {
  return (
    <Control
      container={{
        className: "tabular-nums w-48 flex flex-col box",
      }}
      position="bottomleft"
      prepend
    >
      <CoordinatesInput addMarker={addMarker} />
      <CoordinatesDisplay />
    </Control>
  );
}
