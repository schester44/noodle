import { defaultKeyMaps, Keybind } from "@/editor/extensions/keymaps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { KeybindInput } from "./keybind-input";
import { commands, vimCommands } from "@/editor/commands";

export function KeybindEditDialog({
  open,
  userKeyBinds,
  keybind,
  onClose
}: {
  open: boolean;
  userKeyBinds: Record<string, string>;
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
              validate={(value) => {
                const existing = Object.entries({ ...userKeyBinds, ...defaultKeyMaps }).find(
                  ([c, val]) => val === value && c !== keybind.command
                );

                if (!existing) return null;

                const userCommand = userKeyBinds[existing[0]];
                const isInUse = userCommand && userCommand === value;

                if (!isInUse) return null;

                const { description } = commands[existing[0]] || vimCommands[existing[0]] || {};

                return `This shortcut is already assigned to "${description}"`;
              }}
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
