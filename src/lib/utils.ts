import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json || typeof json !== "string") return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
}

export function getImages(product: { images?: string | null }): string[] {
  return safeParse<string[]>(product.images, []);
}
