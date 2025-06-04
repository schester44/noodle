const keyMap: Record<string, string> = {
  Mod: "⌘",
  "-": "Minus",
  Alt: "⌥",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Backspace: "Backspace",
  Delete: "⌦",
  Enter: "Enter",
  Tab: "Tab",
  Escape: "Esc",
  " ": "Space"
};

export const formatKey = (key: string): string => {
  return keyMap[key] || key;
};

export const formatKeys = (keys: string): string => {
  return keys.split("-").map(formatKey).join("-");
};
