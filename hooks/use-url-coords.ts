import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

import { isWithinMapBounds, removeUrlParams } from "@/components/map";
import type { MarkerData } from "@/components/map/marker";

import { convertMinecraftToLeaflet } from "@/lib/map";

export function useUrlCoordinates(): MarkerData | null {
  const searchParams = useSearchParams();
  const map = useMap();
  const [urlMarker, setUrlMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    const x = searchParams.get("x");
    const z = searchParams.get("z");

    if (x !== null && z !== null) {
      const xi = Number.parseInt(x, 10);
      const zi = Number.parseInt(z, 10);

      if (!Number.isNaN(xi) && !Number.isNaN(zi)) {
        const lf = convertMinecraftToLeaflet(xi, zi);

        if (isWithinMapBounds(lf.lat, lf.lng)) {
          setUrlMarker({
            id: -1,
            name: "Unnamed",
            leaflet: lf,
            minecraft: { x: xi, z: zi },
          });

          map.flyTo(lf, 6, {
            duration: 1.5,
          });
        } else {
          removeUrlParams(searchParams);
        }
      } else {
        removeUrlParams(searchParams);
      }
    } else setUrlMarker(null);
  }, [searchParams, map.flyTo]);

  return urlMarker;
}
