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
import { KeybindEditDialog } from "./keybind-edit-dialog";
import { defaultKeyMaps, Keybind } from "@/editor/extensions/keymaps";
import { useAppStore } from "@/stores/app-store";
import { commands, POSSIBLE_COMMANDS, vimCommands } from "@/editor/commands";
import { useEditorStore } from "@/stores/editor-store";

export function KeybindSettings() {
  const form = useFormContext<FormInputs>();
  const [editingKeybind, setEditingKeybind] = useState<Keybind | null>(null);
  const userKeyBinds = useAppStore((state) => state.userSettings.keyBindings);
  const updateKeyBind = useAppStore((state) => state.updateKeyBinding);

  const activeEditor = useEditorStore((state) => state.editors[state.activeEditor]);

  function handlePossibleKeybindChange(keybind: Keybind) {
    updateKeyBind(keybind);

    activeEditor.setKeymaps({
      ...userKeyBinds,
      [keybind.command]: keybind.keys
    });
  }

  return (
    <div className="space-y-6">
      <KeybindEditDialog
        open={!!editingKeybind}
        keybind={editingKeybind}
        onClose={(keybind) => {
          setEditingKeybind(null);
          handlePossibleKeybindChange(keybind);
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
          {POSSIBLE_COMMANDS.map((command) => {
            const keybind = commands[command] || vimCommands[command];

            const value = userKeyBinds[command] || defaultKeyMaps[command] || "";

            return (
              <div className="flex items-center justify-between group" key={command}>
                <div className="text-sm font-medium flex items-center">{keybind.description}</div>

                <div className="flex items-center">
                  <div className="text-sm text-muted-foreground">{value.replace("Mod-", "⌘-")}</div>
                  <Edit
                    className="ml-4 w-4 opacity-0 group-hover:opacity-100"
                    onClick={() => setEditingKeybind({ ...keybind, command, keys: value })}
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
