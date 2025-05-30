import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { KeybindInput } from "./keybind-input";

export type Keybind = {
  // todo: get these from commands or some central place
  key: string;
  modes?: Array<"normal" | "insert" | "visual">;
  description: string;
  default: string;
  current: string;
};

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
