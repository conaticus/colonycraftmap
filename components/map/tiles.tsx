import { TileLayer } from "react-leaflet";
import { memo } from "react";

import type { calculateMapDimensions } from "@/lib/map";

import { TRANSPARENT_TILE_BASE64 } from "@/constants/map";

const attribution =
  'Map data &copy; <a href="https://earth.motfe.net/" target="_blank">Minecraft Earth Map</a>, <a href="https://colonycraft.org/" target="_blank">Colony Craft</a>, <a href="https://github.com/itsbrunodev/tilegen" target="_blank">tilegen</a> | <a href="https://github.com/itsbrunodev/colonycraft" target="_blank">GitHub</a>';

export const CustomTileLayer = memo(function CustomTileLayer({
  url,
  withAttribution = false,
  opacity = 1,
  dims,
}: {
  url: string;
  withAttribution?: boolean;
  opacity?: number;
  dims: ReturnType<typeof calculateMapDimensions>;
}) {
  return (
    <TileLayer
      attribution={withAttribution ? attribution : undefined}
      url={url}
      errorTileUrl={TRANSPARENT_TILE_BASE64}
      bounds={dims.bounds}
      keepBuffer={8}
      opacity={opacity}
      detectRetina
      noWrap
      tms
    />
  );
});
