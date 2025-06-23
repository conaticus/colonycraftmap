import { toast } from "sonner";
import { useEffect, useState } from "react";

import type { MarkerData } from "@/components/map/marker";
import { isWithinMapBounds } from "@/components/map";

import { convertLeafletToMinecraft } from "@/lib/map";

export interface Markers {
  markers: MarkerData[];
  addMarker: (marker: MarkerData) => void;
  removeMarker: (markerId: number) => void;
  moveMarker: (markerId: number, newLat: number, newLng: number) => void;
  saveMarkers: () => void;
  setMarkers: (markers: MarkerData[]) => void;
}

export function useMarkers(): Markers {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("markers");

    if (stored) setMarkers(JSON.parse(stored));
  }, []);

  function addMarker(marker: MarkerData) {
    setMarkers((prev) => [...prev, marker]);
  }

  function removeMarker(markerId: number) {
    setMarkers((prev) => {
      const u = prev.filter((m) => m.id !== markerId);
      localStorage.setItem("markers", JSON.stringify(u));
      return u;
    });

    toast.success("Deleted marker");
  }

  function moveMarker(markerId: number, newLat: number, newLng: number) {
    if (!isWithinMapBounds(newLat, newLng)) return;

    const minecraft = convertLeafletToMinecraft(newLat, newLng);

    setMarkers((prev) =>
      prev.map((m) =>
        m.id === markerId
          ? { ...m, leaflet: { lat: newLat, lng: newLng }, minecraft }
          : m
      )
    );
  }

  function saveMarkers() {
    localStorage.setItem("markers", JSON.stringify(markers));

    toast.success("Saved marker");
  }

  return {
    markers,
    addMarker,
    removeMarker,
    moveMarker,
    saveMarkers,
    setMarkers,
  };
}
