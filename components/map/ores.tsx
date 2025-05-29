import { LayerGroup, LayersControl } from "react-leaflet";
import { useState } from "react";

import { tileUrl } from "@/lib/utils";

import { ORES } from "@/constants/ores";

import { CustomTileLayer } from "./tiles";

import type { calculateMapDimensions } from ".";

export function OreLayers({
  dims,
}: { dims: ReturnType<typeof calculateMapDimensions> }) {
  const [checkedLayers, setCheckedLayers] = useState<Record<string, boolean>>(
    ORES.reduce(
      (acc, ore) => Object.fromEntries([...Object.entries(acc), [ore, false]]),
      {}
    )
  );

  const handleLayerToggle = (ore: string) => {
    if (ore === "all_ores") {
      setCheckedLayers(
        ORES.reduce(
          (acc, ore) =>
            Object.fromEntries([...Object.entries(acc), [ore, false]]),
          {}
        )
      );
    } else {
      setCheckedLayers((prev) => ({
        ...prev,
        [ore]: !prev[ore],
        all_ores: false,
      }));
    }
  };

  return (
    <LayersControl position="topright">
      {ORES.map((ore) => (
        <LayersControl.Overlay
          name={`<div style="display:inline-flex;align-items:center;justify-content:between;gap:5px;width:100px;"><span style="width:100%;">${ore.id
            .replace(/_/g, " ")
            .replace(/(?:^|\s)\S/g, (a) =>
              a.toUpperCase()
            )}</span>${ore.id !== "all_ores" ? `<span style="width:10px;height:10px;background-color:${ore.color};border-radius:50%;border:1px solid var(--border);" />` : ""}</div>`}
          checked={checkedLayers[ore.id]}
          key={ore.id}
        >
          <LayerGroup eventHandlers={{ add: () => handleLayerToggle(ore.id) }}>
            <CustomTileLayer
              url={tileUrl(ore.id)}
              dims={dims}
              opacity={0.75}
            />
          </LayerGroup>
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  );
}
