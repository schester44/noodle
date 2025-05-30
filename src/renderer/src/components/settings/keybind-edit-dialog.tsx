import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type Keybind = {
  // todo: get these from commands or some central place
  key: string;
  modes?: Array<"normal" | "insert" | "visual">;
  description: string;
  default: string;
  current: string;
};

interface KeybindInputProps {
  value?: string;
  onChange: (keybind: string) => void;
  placeholder?: string;
}

const keyMap: Record<string, string> = {
  Meta: "⌘",
  Control: "⌃",
  Alt: "⌥",
  Shift: "⇧",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Backspace: "⌫",
  Delete: "⌦",
  Enter: "↵",
  Tab: "⇥",
  Escape: "⎋",
  " ": "Space"
};

export function KeybindInput({ value = "", onChange }: KeybindInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const formatKey = (key: string): string => {
    return keyMap[key] || key;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturing) return;

      e.preventDefault();
      e.stopPropagation();

      // Keys for real-time display (always show shift)
      const displayKeys: string[] = [];
      // Keys for final saved value (smart shift handling)
      const saveKeys: string[] = [];

      // Add modifiers in a consistent order
      if (e.metaKey) {
        displayKeys.push("⌘");
        saveKeys.push("⌘");
      }

      if (e.ctrlKey) {
        displayKeys.push("⌃");
        saveKeys.push("⌃");
      }

      if (e.altKey) {
        displayKeys.push("⌥");
        saveKeys.push("⌥");
      }

      if (e.shiftKey) {
        displayKeys.push("⇧");
        // Only add shift to save keys for non-alphabetic keys
      }

      // Add the main key if it's not a modifier
      if (!["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        const isAlphabetic = /^[a-zA-Z]$/.test(e.key);

        if (isAlphabetic) {
          const isUppercase = e.key && e.shiftKey;
          // For alphabetic keys, use uppercase in both display and save
          displayKeys.push(isUppercase ? e.key.toUpperCase() : e.key);
          saveKeys.push(isUppercase ? e.key.toUpperCase() : e.key);
          // Don't add shift to saveKeys for alphabetic characters
        } else {
          // For non-alphabetic keys, keep shift as a modifier
          if (e.shiftKey) {
            saveKeys.push("⇧");
          }

          const formattedKey = formatKey(e.key);

          displayKeys.push(formattedKey);
          saveKeys.push(formattedKey);
        }
      }

      // Update pressed keys in real-time (always show what's being pressed)
      console.log("🪵 displayKeys", displayKeys, saveKeys);
      setPressedKeys(displayKeys);

      // Only finalize the keybind if we have a complete combination (at least one non-modifier key)
      if (saveKeys.length > 0 && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        const keybind = saveKeys.join("+");
        onChange(keybind);
        setIsCapturing(false);
        setPressedKeys([]);
        inputRef.current?.blur(); // Remove focus from the input
      }
    },
    [isCapturing, onChange]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturing) return;

      // Update the display to reflect released keys
      const keys: string[] = [];

      if (e.metaKey) keys.push("⌘");
      if (e.ctrlKey) keys.push("⌃");
      if (e.altKey) keys.push("⌥");
      if (e.shiftKey) keys.push("⇧");

      setPressedKeys(keys);
    },
    [isCapturing]
  );

  const handleFocus = () => {
    setIsCapturing(true);
  };

  const handleBlur = () => {
    setIsCapturing(false);
    setPressedKeys([]);
  };

  const clearKeybind = () => {
    onChange("");
    setIsCapturing(false);
  };

  useEffect(() => {
    if (!isCapturing) return;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isCapturing, handleKeyDown, handleKeyUp]);

  console.log(value);

  return (
    <div className="relative">
      <div
        ref={inputRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md cursor-text transition-colors
          ${
            isCapturing
              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }
          ${!value && !isCapturing ? "text-gray-500" : "text-gray-900"}
        `}
      >
        {isCapturing && pressedKeys.length > 0 && (
          <div className="font-mono text-xl flex items-center gap-1">
            {pressedKeys.map((key, index) => {
              return (
                <div
                  key={index}
                  className="text-muted bg-gray-200 px-2 rounded shadow-sm flex items-center justify-center"
                >
                  {formatKey(key)}
                </div>
              );
            })}
          </div>
        )}

        {!isCapturing && value && (
          <div className="font-mono text-xl flex items-center gap-1">
            {value.split("+").map((key, index) => {
              return (
                <div
                  key={index}
                  className="text-muted bg-gray-200 px-2 rounded shadow-sm flex items-center justify-center"
                >
                  {formatKey(key)}
                </div>
              );
            })}
          </div>
        )}

        {isCapturing && pressedKeys.length === 0 && (
          <div className="text-gray-500 py-0.5">Press keys to capture keybind...</div>
        )}

        {!isCapturing && !value && (
          <div className="text-gray-500 py-0.5">Click to add keybind...</div>
        )}
      </div>

      {value && (
        <button
          onClick={clearKeybind}
          className=" text-black absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Clear keybind"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function KeybindEditDialog({
  open,
  keybind,
  onClose
}: {
  open: boolean;
  keybind: Keybind | null;
  onClose: (kb: { current: string }) => void;
}) {
  if (!keybind) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onClose(keybind);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Keybind</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-md">{keybind.description}</div>
          {keybind.modes?.length && (
            <div className="text-sm text-muted-foreground">
              This keybind will only work in the following mode(s): {keybind.modes.join(", ")}
            </div>
          )}

          <div>
            <KeybindInput
              value={keybind?.current}
              onChange={(value) => onClose({ current: value })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
