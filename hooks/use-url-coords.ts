import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { isWithinMapBounds, removeUrlParams } from "@/components/map";

import { convertMinecraftToLeaflet } from "@/lib/map";
import { useMarkers } from "./use-markers";

export function useUrlCoordinates() {
  const searchParams = useSearchParams();
  const map = useMap();

  const { addMarker } = useMarkers();

  useEffect(() => {
    const x = searchParams.get("x");
    const z = searchParams.get("z");

    if (x !== null && z !== null) {
      const xi = Number.parseInt(x, 10);
      const zi = Number.parseInt(z, 10);

      if (!Number.isNaN(xi) && !Number.isNaN(zi)) {
        const lf = convertMinecraftToLeaflet(xi, zi);

        if (isWithinMapBounds(lf.lat, lf.lng)) {
          map.flyTo(lf, 6, {
            duration: 1.5,
          });

          addMarker(lf);
        } else {
          removeUrlParams(searchParams);
        }
      } else {
        removeUrlParams(searchParams);
      }
    }
  }, [searchParams, map.flyTo]);
}
