import { MAP_CONFIG } from "@/constants/map";

import type { CoordinateConfig } from "./types";

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

export function createCoordinateConfig(): CoordinateConfig {
  const { effectiveWidth, effectiveHeight } = calculateMapDimensions();

  return {
    blocksPerLeafletUnit: MAP_CONFIG.BLOCKS_PER_CRS_UNIT_AT_MAX_ZOOM,
    leafletOriginLngForMinecraftZero: effectiveWidth / 2,
    leafletOriginLatForMinecraftZero: -effectiveHeight / 2,
  };
}

const CONFIG = createCoordinateConfig();

export function convertMinecraftToLeaflet(
  x: number,
  z: number
): { lat: number; lng: number } {
  return {
    lat:
      CONFIG.leafletOriginLatForMinecraftZero - z / CONFIG.blocksPerLeafletUnit,
    lng:
      CONFIG.leafletOriginLngForMinecraftZero + x / CONFIG.blocksPerLeafletUnit,
  };
}

export function convertLeafletToMinecraft(
  lat: number,
  lng: number
): { x: number; z: number } {
  return {
    x: Math.round(
      (lng - CONFIG.leafletOriginLngForMinecraftZero) *
        CONFIG.blocksPerLeafletUnit
    ),
    z: Math.round(
      (CONFIG.leafletOriginLatForMinecraftZero - lat) *
        CONFIG.blocksPerLeafletUnit
    ),
  };
}
