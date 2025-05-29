import { useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import Control from "react-leaflet-custom-control";
import { LocateIcon } from "lucide-react";
import { toast } from "sonner";

import type { useMarkers } from "@/hooks/use-markers";

import { MAP_CONFIG } from "@/constants/map";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { calculateMapDimensions } from ".";

export interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

export function createCoordinateConfig(): CoordinateConfig {
  const { effectiveWidth, effectiveHeight } = calculateMapDimensions();

  return {
    blocksPerLeafletUnit: MAP_CONFIG.BLOCKS_PER_CRS_UNIT_AT_MAX_ZOOM,
    leafletOriginLngForMinecraftZero: effectiveWidth / 2,
    leafletOriginLatForMinecraftZero: -effectiveHeight / 2,
  };
}

export function convertMinecraftToLeaflet(
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

export function convertLeafletToMinecraft(
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

function CoordinatesInput({
  addMarker,
}: {
  addMarker: ReturnType<typeof useMarkers>["addMarker"];
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

  function locateCoords() {
    const x = Number.parseInt(coords.x);
    const z = Number.parseInt(coords.z);

    if (
      !Number.isNaN(x) &&
      !Number.isNaN(z) &&
      Math.abs(x) <= MAP_CONFIG.IMAGE_WIDTH / 2 &&
      Math.abs(z) <= MAP_CONFIG.IMAGE_HEIGHT / 2
    ) {
      const lf = convertMinecraftToLeaflet(x, z, createCoordinateConfig());

      addMarker({
        id: Date.now(),
        minecraft: { x, z },
        leaflet: lf,
      });

      map.flyTo(lf, 6, {
        duration: 1.5,
      });
    } else {
      toast.error("Invalid coordinates");
    }
  }

  return (
    <div className="text-sm flex flex-col gap-2 p-2 border-b border-b-border">
      <span className="italic text-muted-foreground">Locate coordinates</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <label
            className="!w-4"
            htmlFor="x"
          >
            X
          </label>
          <Input
            id="x"
            value={coords.x}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center">
          <label
            className="!w-4"
            htmlFor="z"
          >
            Z
          </label>
          <Input
            id="z"
            value={coords.z}
            onChange={handleChange}
          />
        </div>
      </div>
      <Button
        className="ml-auto"
        variant="outline"
        size="xs"
        title="Locate coordinates on map"
        onClick={locateCoords}
      >
        <LocateIcon className="size-3.5" />
        Locate
      </Button>
    </div>
  );
}

function CoordinatesDisplay({ config }: { config: CoordinateConfig }) {
  const {
    leafletOriginLngForMinecraftZero,
    leafletOriginLatForMinecraftZero,
    blocksPerLeafletUnit,
  } = config;

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
    <div className="text-sm flex flex-col p-2">
      <span>
        X {coords.minecraft.x}, Z {coords.minecraft.z}
      </span>
      <span className="italic text-muted-foreground">
        Lat {coords.leaflet.lat.toFixed(3)}, Lng {coords.leaflet.lng.toFixed(3)}
      </span>
    </div>
  );
}

export function Coordinates({
  config,
  addMarker,
}: {
  config: CoordinateConfig;
  addMarker: ReturnType<typeof useMarkers>["addMarker"];
}) {
  return (
    <Control
      container={{
        className: "tabular-nums min-w-44 flex flex-col rounded-md",
      }}
      position="bottomleft"
      prepend
    >
      <CoordinatesInput addMarker={addMarker} />
      <CoordinatesDisplay config={config} />
    </Control>
  );
}
