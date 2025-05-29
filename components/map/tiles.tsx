import { TileLayer } from "react-leaflet";

import { TRANSPARENT_TILE_BASE64 } from "@/constants/map";

import type { calculateMapDimensions } from ".";

export function CustomTileLayer({
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
  const attribution =
    'Map data &copy; <a href="https://earth.motfe.net/" target="_blank">Minecraft Earth map</a>, <a href="https://colonycraft.org/" target="_blank">Colony Craft</a>, Tiles generated using <a href="https://github.com/itsbrunodev/tilegen" target="_blank">tilegen</a>';

  return (
    <TileLayer
      // attribution='Map data &copy; <a href="https://earth.motfe.net/" target="_blank">Minecraft Earth map</a>, <a href="https://colonycraft.org/" target="_blank">Colony Craft</a>, Generated using <a href="https://github.com/itsbrunodev/tilegen" target="_blank">tilegen</a>'
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
}
