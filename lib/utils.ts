import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tileUrl(type: string) {
  return decodeURI(
    new URL(
      `/tiles/${type}/{z}/{x}/{y}.webp?v=${process.env.NEXT_PUBLIC_TILE_VERSION}`,
      process.env.NEXT_PUBLIC_URL
    ).href
  );
}

export async function fetcher(url: string) {
  return await fetch(url).then((res) => res.json());
}

export function acronym(str: string) {
  return str
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);
}

export function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
