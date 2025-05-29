import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tileUrl(type: string) {
  return decodeURI(
    new URL(
      `/tiles/${type}/{z}/{x}/{y}.png?v=${process.env.NEXT_PUBLIC_TILE_VERSION}`,
      process.env.NEXT_PUBLIC_URL
    ).href
  );
}
