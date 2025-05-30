import { EditorInstance } from "../editor";
import { Compartment, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { Command, commands, VimCommand, vimCommands } from "../commands";
import { Vim } from "@replit/codemirror-vim";
import { indentWithTab } from "@codemirror/commands";
import { ghostTextValueField } from "./ghost-text";

const cmd = (keys: string, command: Command) => ({ keys, command });
const vimcmd = (keys: string, command: VimCommand) => ({ keys, command });

type Keymap = {
  defaultKeys?: string;
  command: Command | VimCommand;
  description: string;
  modes?: Array<"normal" | "insert" | "visual">;
};

export type Keybind = Keymap & { keys: string };

export const defaultKeyMaps: Record<Command | VimCommand, string> = {
  selectAll: "Mod-a",
  addNewBlockAtCursor: "Mod-Enter",
  addNewBlockAfterCurrent: "Mod-Shift-Enter",
  addNewBlockBeforeCurrent: "Mod-Shift-Backspace",
  toggleBlockFold: "zb",
  toggleCheckbox: "Enter"
};

export const DEFAULT_KEYMAPS = Object.entries(defaultKeyMaps).map(([command, keys]) => {
  return cmd(keys, command as Command);
});

export const DEFAULT_VIM_KEYMAPS = [vimcmd("zb", "toggleBlockFold")];

DEFAULT_VIM_KEYMAPS.forEach((k) => {
  Vim.defineAction(k.command, (cm) => {
    const view = cm.cm6;
    if (!view) return;

    const command = vimCommands[k.command];

    return command.run(view);
  });

  Vim.mapCommand(k.keys, "action", k.command, [], {});
});

// Only add the indent with tab keymap if there is no ghost text
const conditionalIndentKeymap = keymap.compute([ghostTextValueField], (state) => {
  const ghostValue = state.field(ghostTextValueField, false);

  return !ghostValue ? [indentWithTab] : [];
});

export const keymapCompartment = new Compartment();

function getKeymaps(
  defaultKeyMap: Array<{ command: Command; keys: string }>,
  userKeyBinds: Record<string, string>
) {
  return [
    ...Object.entries(userKeyBinds)
      .filter(([command]) => !!commands[command])
      .map(([command, keys]) => {
        return cmd(keys, command as Command);
      }),
    ...DEFAULT_KEYMAPS.filter((keymap) => {
      return !userKeyBinds[keymap.command] || userKeyBinds[keymap.command] === keymap.keys;
    })
  ];
}

export function keymapExtension({
  editor,
  userKeyBinds
}: {
  editor: EditorInstance;
  userKeyBinds: Record<string, string>;
}) {
  const keybinds = getKeymaps(DEFAULT_KEYMAPS, userKeyBinds);

  return [
    conditionalIndentKeymap,
    Prec.high(
      keymap.of(
        keybinds.map((k) => {
          return {
            key: k.keys,
            run: (view) => {
              const command = commands[k.command];
              console.log(`Running command: ${k.command}`, k.keys);

              if (!command) {
                return false;
              }

              return command.run(editor)(view);
            }
          };
        })
      )
    )
  ];
}
