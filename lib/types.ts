export interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

export interface Settings {
  showMarkerNames: boolean;
  showTransportation: boolean;
}

export interface Player {
  name: string;
  uuid: string;
  avatar: string;
}

export interface PlayerInfo {
  online: number;
  max: number;
  players: Player[];
}

export interface ServerResponse {
  players?: {
    online: number;
    max: number;
    sample?: Array<{
      name: string;
      id: string;
    }>;
  };
}

export interface VarIntResult {
  value: number;
  bytesRead: number;
}

export type TransportationType = "minecart" | "boat" | "tunnel";

export type TransportationPointType = "station" | "junction" | "terminal";

export interface Transportation {
  name: string;
  color: string;
  type: TransportationType | TransportationType[];
  points: {
    type?: TransportationPointType;
    name?: string;
    x: number;
    z: number;
  }[]; // minecraft coords and not leaflet lat lng
}

export interface Colony {
  name: string;
  chunks: { x: number; z: number }[];
}
