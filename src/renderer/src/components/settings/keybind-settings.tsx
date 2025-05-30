import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "./schema";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Keybind, KeybindEditDialog } from "./keybind-edit-dialog";

const defaultKeybinds: Keybind[] = [
  {
    key: "moveLineUp",
    modes: ["normal"],
    description: "Move the current line up",
    default: "K",
    current: "K"
  },
  {
    key: "moveLineDown",
    modes: ["normal"],
    description: "Move the current line down",
    default: "J",
    current: "J"
  }
];

export function KeybindSettings() {
  const form = useFormContext<FormInputs>();
  const [editingKeybind, setEditingKeybind] = useState<Keybind | null>(null);

  const [keybinds, setKeybinds] = useState<Keybind[]>(defaultKeybinds);

  return (
    <div className="space-y-6">
      <KeybindEditDialog
        open={!!editingKeybind}
        keybind={editingKeybind}
        onClose={({ current }) => {
          setEditingKeybind(null);

          // TODO: Just here for mocking
          setKeybinds((prev) => {
            return prev.map((keybind) => {
              if (keybind.key === editingKeybind?.key) {
                return {
                  ...keybind,
                  current
                };
              }

              return keybind;
            });
          });

          /**
           * 1. Need to persist the keybinds to the user settings.
           * 2. Need to pull the keybinds from the user settings for display.
           * 3. Need to update the keybinds in the editor instance.
           * 4. Need to ensure that the keybinds are unique and do not conflict with each other.
           * 5. Require a modifier or something if the move is not normal/visual.
           * */
        }}
      />
      <Card>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="vim"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>VIM Keybinds</FormLabel>
                  <FormDescription className="mt-1">Use VIM keybinds in the editor</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Keybinds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {keybinds.map((keybind) => {
            return (
              <div className="flex items-center justify-between group" key={keybind.key}>
                <div className="text-sm font-medium flex items-center">{keybind.description}</div>

                <div className="flex items-center">
                  <div className="text-sm text-muted-foreground">{keybind.current}</div>
                  <Edit
                    className="ml-4 w-4 opacity-0 group-hover:opacity-100"
                    onClick={() => setEditingKeybind(keybind)}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
