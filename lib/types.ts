export interface CoordinateConfig {
  leafletOriginLngForMinecraftZero: number;
  leafletOriginLatForMinecraftZero: number;
  blocksPerLeafletUnit: number;
}

export interface Settings {
  showMarkerNames: boolean;
}

export type Colony = [[number, number], [number, number]];
