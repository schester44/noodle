import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cmToTinyKeys(cmKey: string): string {
  const parts = cmKey.split("-");

  const modifiers = new Set<string>();
  let key = "";

  for (const part of parts) {
    switch (part.toLowerCase()) {
      case "mod":
        modifiers.add("Meta");
        break;
      case "ctrl":
      case "control":
        modifiers.add("Control");
        break;
      case "alt":
        modifiers.add("Alt");
        break;
      case "shift":
        modifiers.add("Shift");
        break;
      case "meta":
        modifiers.add("Meta");
        break;
      default:
        key = part;
        break;
    }
  }

  const isUppercase = /[A-Z]/.test(key);
  if (isUppercase) modifiers.add("Shift");

  return [...modifiers].join("+") + (key ? "+" + key.toLowerCase() : "");
}
