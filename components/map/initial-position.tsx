import { useMap } from "react-leaflet";
import { useEffect } from "react";

// import { useLocalStorage } from "@/hooks/use-local-storage";

export function InitialPositionHandler() {
  const map = useMap();

  /* const [{ position, zoom }, setInitialPosition] = useLocalStorage<{
    position: L.LatLngTuple;
    zoom: number;
  }>("initial-position", {
    position: [0, 0],
    zoom: 3,
  }); */

  // fly to initial position on load
  useEffect(() => {
    function storeInitialPosition() {
      const center = map.getCenter();
      const zoom = map.getZoom();

      /* setInitialPosition({
        position: [center.lat, center.lng],
        zoom,
      }); */

      localStorage.setItem(
        "initial-position",
        JSON.stringify({ position: [center.lat, center.lng], zoom })
      );
    }

    window.addEventListener("beforeunload", storeInitialPosition);

    const data = localStorage.getItem("initial-position");

    if (data) {
      const position = JSON.parse(data).position as L.LatLngTuple;
      const zoom = JSON.parse(data).zoom as number;

      if (position[0] !== 0 && position[1] !== 0) {
        map.flyTo(position, zoom, {
          animate: false,
        });
      }
    }

    return () => {
      window.removeEventListener("beforeunload", storeInitialPosition);
    };
  }, [
    map.flyTo,
    map.getCenter,
    map.getZoom,
    /* setInitialPosition,
    position,
    zoom, */
  ]);

  return null;
}
