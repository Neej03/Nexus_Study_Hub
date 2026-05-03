import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID (simple version for local state)
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
