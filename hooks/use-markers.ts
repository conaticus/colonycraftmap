import { useReducer, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { isWithinMapBounds } from "@/components/map";
import type { MarkerData } from "@/components/map/marker";

import { convertLeafletToMinecraft } from "@/lib/map";
import { MAP_STORAGE_KEY } from "@/constants/map";

enum ActionType {
  LOAD = "LOAD",
  ADD = "ADD",
  UPDATE = "UPDATE",
  REMOVE = "REMOVE",
  RENAME = "RENAME",
}

interface LoadAction {
  type: ActionType.LOAD;
  payload: MarkerData[];
}

interface AddAction {
  type: ActionType.ADD;
  payload: MarkerData;
}

interface UpdateAction {
  type: ActionType.UPDATE;
  payload: { id: number; updates: Partial<Omit<MarkerData, "id">> };
}

interface RenameAction {
  type: ActionType.RENAME;
  payload: { id: number; name: string };
}

interface RemoveAction {
  type: ActionType.REMOVE;
  payload: { id: number };
}

type Action =
  | LoadAction
  | AddAction
  | UpdateAction
  | RenameAction
  | RemoveAction;

function initMarkers(): MarkerData[] {
  const stored = localStorage.getItem(MAP_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: MarkerData[] = JSON.parse(stored);
    return parsed
      .filter((m) => isWithinMapBounds(m.leaflet.lat, m.leaflet.lng))
      .map((m) => ({ ...m, name: m.name || "Unnamed" }));
  } catch {
    console.warn("Failed to parse stored markers");
    return [];
  }
}

function reducer(state: MarkerData[], action: Action): MarkerData[] {
  switch (action.type) {
    case ActionType.LOAD: {
      return action.payload;
    }
    case ActionType.ADD: {
      if (
        state.some(
          (m) =>
            m.leaflet.lat === action.payload.leaflet.lat &&
            m.leaflet.lng === action.payload.leaflet.lng
        )
      ) {
        return state;
      }

      return [...state, action.payload];
    }
    case ActionType.UPDATE: {
      return state.map((m) =>
        m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
      );
    }
    case ActionType.RENAME: {
      return state.map((m) =>
        m.id === action.payload.id ? { ...m, name: action.payload.name } : m
      );
    }
    case ActionType.REMOVE: {
      return state.filter((m) => m.id !== action.payload.id);
    }
    default: {
      return state;
    }
  }
}

export function useMarkers() {
  const [markers, dispatch] = useReducer(reducer, [], initMarkers);

  useEffect(() => {
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(markers));
  }, [markers]);

  const addMarker = useCallback((leaflet: { lat: number; lng: number }) => {
    const { lat, lng } = leaflet;

    if (!isWithinMapBounds(lat, lng)) {
      return;
    }

    const id = Date.now();

    dispatch({
      type: ActionType.ADD,
      payload: {
        id,
        name: "Unnamed",
        leaflet: { lat, lng },
        minecraft: convertLeafletToMinecraft(lat, lng),
      },
    });
  }, []);

  const moveMarker = useCallback((id: number, lat: number, lng: number) => {
    if (!isWithinMapBounds(lat, lng)) {
      return;
    }

    dispatch({
      type: ActionType.UPDATE,
      payload: {
        id,
        updates: {
          leaflet: { lat, lng },
          minecraft: convertLeafletToMinecraft(lat, lng),
        },
      },
    });
  }, []);

  const renameMarker = useCallback((id: number, name: string) => {
    dispatch({
      type: ActionType.RENAME,
      payload: { id, name: name || "Unnamed" },
    });
  }, []);

  const removeMarker = useCallback((id: number) => {
    dispatch({ type: ActionType.REMOVE, payload: { id } });

    toast.success("Deleted marker");
  }, []);

  return { markers, addMarker, moveMarker, renameMarker, removeMarker };
}
