import { Circle, Polyline, Tooltip } from "react-leaflet";
import { Fragment } from "react";

import type { Transportation } from "@/lib/types";
import { convertMinecraftToLeaflet } from "@/lib/map";
import { capitalizeWords } from "@/lib/utils";

import { TRANSPORTATION } from "@/constants/transportation";

import { TooltipRow } from "../tooltip-row";

function TransportationMode({ mode }: { mode: Transportation["mode"] }) {
  return (
    <TooltipRow
      label="Mode of Transport"
      value={
        Array.isArray(mode)
          ? mode.map(capitalizeWords).join(", ")
          : capitalizeWords(mode)
      }
    />
  );
}

export function TransportationLayer({
  showTransportation,
}: { showTransportation: boolean }) {
  if (!showTransportation) {
    return null;
  }

  return (
    <>
      {TRANSPORTATION.map((transportation) => (
        <Fragment key={transportation.name}>
          <Polyline
            pathOptions={{
              color: transportation.color,
              opacity: 0.35,
              weight: 8,
              interactive: true,
            }}
            positions={transportation.points.map(({ x, z }) => [
              convertMinecraftToLeaflet(x, z).lat,
              convertMinecraftToLeaflet(x, z).lng,
            ])}
          >
            <Tooltip
              className="box !w-52 !opacity-100 before:!border-t-background !animate-none"
              direction="top"
              permanent={false}
              sticky
            >
              <TooltipRow
                label="Name"
                value={transportation.name}
              />
              <TransportationMode mode={transportation.mode} />
              <TooltipRow
                label="Length"
                value={`${transportation.points.reduce(
                  (prev, { x, z }, i, arr) =>
                    prev +
                    (i === 0
                      ? 0
                      : Math.hypot(arr[i - 1].x - x, arr[i - 1].z - z)),
                  0
                )} m`}
              />
            </Tooltip>
          </Polyline>
          {transportation.points
            .filter(({ name }) => Boolean(name))
            .map(({ name, type, x, z }) => (
              <Circle
                radius={0}
                pathOptions={{
                  color: transportation.color,
                  opacity: 1,
                  fillColor: transportation.color,
                  fillOpacity: 1,
                  weight: 10,
                  interactive: true,
                }}
                center={convertMinecraftToLeaflet(x, z)}
                key={name}
              >
                <Tooltip
                  className="box !w-52 !opacity-100 before:!border-t-background !animate-none"
                  direction="top"
                  permanent={false}
                  sticky
                >
                  <TooltipRow
                    label="Name"
                    value={`${name} ${capitalizeWords(type)}`}
                  />
                  <TransportationMode mode={transportation.mode} />
                  <TooltipRow
                    label="Coordinates"
                    value={`X ${x}, Z ${z}`}
                  />
                </Tooltip>
              </Circle>
            ))}
        </Fragment>
      ))}
    </>
  );
}
