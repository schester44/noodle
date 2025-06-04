import { formatKey } from "@/lib/keybinds";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface KeybindInputProps {
  value?: string;
  allowSequences?: boolean;
  requireModifier?: boolean;
  onChange: (keybind: string) => void;
  placeholder?: string;
  validate?: (value: string) => string | null;
}

export function KeybindInput({
  value = "",
  validate,
  requireModifier,
  allowSequences,
  onChange
}: KeybindInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [sequenceKeys, setSequenceKeys] = useState<string[]>([]);
  const [isInSequence, setIsInSequence] = useState(false);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const clearSequenceTimeout = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  }, []);

  const handleSaveOrWarn = useCallback(
    (value: string) => {
      const warning = validate ? validate(value) : null;

      if (warning) {
        setWarning(warning);
        return false;
      }

      return onChange(value);
    },
    [validate, onChange]
  );

  const completeSequence = useCallback(
    (currentSequence?: string[]) => {
      const sequence = currentSequence || sequenceKeys;

      if (sequence.length > 0) {
        const keybind = sequence.join("");
        handleSaveOrWarn(keybind);
      }
      setIsInSequence(false);
      setSequenceKeys([]);
      setIsCapturing(false);
      clearSequenceTimeout();
    },
    [sequenceKeys, handleSaveOrWarn, clearSequenceTimeout]
  );

  const startSequenceTimeout = useCallback(
    (currentSequence: string[]) => {
      clearSequenceTimeout();
      sequenceTimeoutRef.current = setTimeout(() => {
        completeSequence(currentSequence);
      }, 2000);
    },
    [clearSequenceTimeout, completeSequence]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturing) return;

      e.preventDefault();
      e.stopPropagation();

      const modifierKeys = ["Meta", "Control", "Alt", "Shift"];
      // Keys for real-time display (always show shift)
      const displayKeys: string[] = [];
      // Keys for final saved value (smart shift handling)
      const saveKeys: string[] = [];

      setWarning(null);

      if (e.key === "Escape") {
        setIsCapturing(false);
        setIsInSequence(false);
        setSequenceKeys([]);
        setPressedKeys([]);
        clearSequenceTimeout();
        return;
      }

      const hasModifiers = e.metaKey || e.ctrlKey || e.altKey;
      const isAlphabetic = /^[a-zA-Z]$/.test(e.key);
      const isNumber = /^[0-9]$/.test(e.key);

      if (requireModifier && !hasModifiers) {
        setWarning("This keybind requires a modifier key (Ctrl, Alt, or Meta).");
        setTimeout(() => setWarning(null), 2000);
        return;
      }

      // If we're in sequence mode and this is a simple key, add to sequence
      if (isInSequence && !hasModifiers && (isAlphabetic || isNumber)) {
        const newSequence = [...sequenceKeys, e.key];
        setSequenceKeys(newSequence);
        startSequenceTimeout(newSequence);
        return;
      }

      // If this could start a sequence (single letter/number, no modifiers, sequences allowed)
      if (allowSequences && !hasModifiers && (isAlphabetic || isNumber) && !isInSequence) {
        const newSequence = [e.key];
        setIsInSequence(true);
        setSequenceKeys(newSequence);
        setPressedKeys([]);
        startSequenceTimeout(newSequence);
        return;
      }

      // Add modifiers in a consistent order
      if (e.metaKey) {
        displayKeys.push("⌘");
        saveKeys.push("Mod");
      }

      if (e.ctrlKey) {
        displayKeys.push("Ctrl");
        saveKeys.push("Ctrl");
      }

      if (e.altKey) {
        displayKeys.push("⌥");
        saveKeys.push("Alt");
      }

      if (e.shiftKey) {
        displayKeys.push("Shift");
        // Only add shift to save keys for non-alphabetic keys
      }

      // Add the main key if it's not a modifier
      if (!modifierKeys.includes(e.key)) {
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
            saveKeys.push("Shift");
          }

          const formattedKey = formatKey(e.key);

          displayKeys.push(formattedKey);
          saveKeys.push(formattedKey);
        }
      }

      setPressedKeys(displayKeys);

      if (saveKeys.length > 0 && !modifierKeys.includes(e.key)) {
        const keybind = saveKeys.join("-");
        handleSaveOrWarn(keybind);
        setIsCapturing(false);
        setPressedKeys([]);
        inputRef.current?.blur();
      }
    },
    [
      isCapturing,
      allowSequences,
      isInSequence,
      sequenceKeys,
      startSequenceTimeout,
      handleSaveOrWarn,
      clearSequenceTimeout,
      requireModifier
    ]
  );

  useEffect(() => {
    return () => {
      clearSequenceTimeout();
    };
  }, [clearSequenceTimeout]);

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isCapturing || isInSequence) return;

      // Update the display to reflect released keys
      const keys: string[] = [];

      if (e.metaKey) keys.push("⌘");
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("⌥");
      if (e.shiftKey) keys.push("Shift");

      setPressedKeys(keys);
    },
    [isCapturing, isInSequence]
  );

  const handleFocus = () => {
    setIsCapturing(true);
  };

  const handleBlur = () => {
    setIsCapturing(false);
    setPressedKeys([]);
  };

  const clearKeybind = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <div className="relative">
      <div
        ref={inputRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md cursor-text transition-colors relative
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

        {isCapturing && isInSequence && sequenceKeys.length > 0 && (
          <div className="font-mono text-xl flex items-center gap-1">
            {sequenceKeys.map((key, index) => {
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
            {value.split("-").map((key, index) => {
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

        {isCapturing && pressedKeys.length === 0 && sequenceKeys.length === 0 && (
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

      {warning && <div className="text-red-500 text-sm mt-2">{warning}</div>}

      {isInSequence && (
        <span className="text-xs text-muted-foreground">Building sequence... (2s timeout)</span>
      )}
    </div>
  );
}
