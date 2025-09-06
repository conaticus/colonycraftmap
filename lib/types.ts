export interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

export interface Settings {
  showMarkerNames: boolean;
  showTransportation: boolean;
  showColonies: boolean;
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
  leaderId: string;
  /** https://javadoc.io/doc/net.kyori/adventure-api/latest/net/kyori/adventure/text/format/NamedTextColor.html */
  colour: string;
  chunks: { x: number; z: number }[];
}

export interface ProcessedColony extends Colony {
  leafletCoords: [number, number][];
  size: string;
  area: number;
  leader: {
    id: string;
    name: string;
    avatar: string;
  };
}

export type ColoniesEndpointResponse =
  | {
      success: true;
      data: Colony[];
    }
  | {
      success: false;
      message: string;
      data: [];
    };
