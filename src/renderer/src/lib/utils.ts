import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// this isn't perfect but it works for now.
// outputs Shift+Meta+Shift+N for Mod-N
export function cmToTinyKeys(key: string) {
  return key
    .replace("Mod-", "Meta+")
    .replace("Ctrl-", "Control+")
    .replace(/([A-Z])/g, (match) => (key.includes("Shift+") ? match : `Shift+${match}`));
}
