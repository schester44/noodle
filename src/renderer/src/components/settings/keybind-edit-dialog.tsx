import { Keybind } from "@/editor/extensions/keymaps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { KeybindInput } from "./keybind-input";

export function KeybindEditDialog({
  open,
  keybind,
  onClose
}: {
  open: boolean;
  keybind: Keybind | null;
  onClose: (kb: Keybind) => void;
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

        <div>
          <div className="text-md">{keybind.description}</div>
          {keybind.modes?.length && (
            <div className="text-sm text-muted-foreground">
              This keybind will only work in the following mode(s): {keybind.modes.join(", ")}
            </div>
          )}

          <div className="mt-4">
            <KeybindInput
              requireModifier={!keybind.modes || keybind.modes.includes("insert")}
              allowSequences={keybind.modes && keybind.modes.includes("normal")}
              value={keybind.keys}
              onChange={(value) => onClose({ ...keybind, keys: value })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
