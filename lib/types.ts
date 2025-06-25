export interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

export interface Settings {
  showMarkerNames: boolean;
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

export interface Colony {
  name: string;
  chunks: { x: number; z: number }[];
}
