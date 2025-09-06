import { LayerGroup, LayersControl } from "react-leaflet";
import { useState, useCallback, useMemo } from "react";

import { tileUrl } from "@/lib/utils";
import type { calculateMapDimensions } from "@/lib/map";

import { ORES } from "@/constants/ores";

import { CustomTileLayer } from "./tiles";

export function OreLayers({
  dims,
}: {
  dims: ReturnType<typeof calculateMapDimensions>;
}) {
  const initialState = useMemo(
    () =>
      ORES.reduce(
        (acc, ore) => Object.assign(acc, { [ore.id]: ore.id === "all_ores" ),
        {} as Record<string, boolean>
      ),
    []
  );

  const [checkedLayers, setCheckedLayers] =
    useState<Record<string, boolean>>(initialState);

  const handleLayerToggle = useCallback(
    (ore: string) => {
      setCheckedLayers((prev) => ({
        ...prev,
        [ore]: !prev[ore],
      }));
    },
    [initialState]
  );

  return (
    <LayersControl position="topright">
      {ORES.map((ore) => (
        <LayersControl.Overlay
          name={`<div style="display:inline-flex;align-items:center;justify-content:between;gap:5px;width:100px;"><span style="width:100%;">${ore.id
            .replace(/_/g, " ")
            .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())}</span>${
            ore.id !== "all_ores"
              ? `<span style="width:10px;height:10px;background-color:${ore.color};border-radius:50%;border:1px solid var(--border);" />`
              : ""
          }</div>`}
          checked={checkedLayers[ore.id]}
          key={ore.id}
        >
          <LayerGroup eventHandlers={{ add: () => handleLayerToggle(ore.id) }}>
            <CustomTileLayer url={tileUrl(ore.id)} dims={dims} />
          </LayerGroup>
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  );
}
