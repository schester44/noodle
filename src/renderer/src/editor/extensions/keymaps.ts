import { EditorInstance } from "../editor";
import { Compartment, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { Command, commands, VimCommand, vimCommands } from "../commands";
import { Vim } from "@replit/codemirror-vim";
import { indentWithTab } from "@codemirror/commands";
import { ghostTextValueField } from "./ghost-text";

const cmd = (keys: string, command: Command | VimCommand) => ({ keys, command });

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
  toggleCheckbox: "Enter",
  moveLineUp: "K",
  moveLineDown: "J",
  gotoLastNote: "Ctrl-6",
  newDailyNote: "Mod-d",
  newNote: "Mod-n",
  browseNotes: "Mod-k",
  startPrompt: "Mod-p"
};

export const DEFAULT_KEYMAPS = Object.entries(defaultKeyMaps).map(([command, keys]) => {
  return cmd(keys, command as Command);
});

export function registerVimKeymaps(editor: EditorInstance, userKeyBinds: Record<string, string>) {
  const keymaps = [
    ...Object.entries(userKeyBinds)
      .filter(([command]) => !!vimCommands[command])
      .map(([command, keys]) => {
        return cmd(keys, command as VimCommand);
      }),
    ...DEFAULT_KEYMAPS.filter((keymap) => {
      return vimCommands[keymap.command] && !userKeyBinds[keymap.command];
    })
  ];

  function convertToVimKeys(keys: string): string {
    keys = keys.replace("Enter", "<CR>");

    // FIXME: This will need to be more robust for complex combinations

    if (keys.includes("Ctrl-")) {
      keys = keys.replace("Ctrl-", "<C-");
      keys += ">";
    }

    return keys;
  }

  keymaps.forEach((k) => {
    const command = vimCommands[k.command];

    command.modes = command.modes || ["normal"];

    const keys = convertToVimKeys(k.keys);

    command.modes.forEach((mode) => {
      Vim.unmap(keys, mode);
    });

    Vim.defineAction(k.command, (cm) => {
      const view = cm.cm6;
      if (!view) return;

      const command = vimCommands[k.command];

      return command.run({ editor, view });
    });

    Vim.mapCommand(keys, "action", k.command, [], {});
  });
}

// Only add the indent with tab keymap if there is no ghost text
const conditionalIndentKeymap = keymap.compute([ghostTextValueField], (state) => {
  const ghostValue = state.field(ghostTextValueField, false);

  return !ghostValue ? [indentWithTab] : [];
});

export const keymapCompartment = new Compartment();

export function getBrowseNotesKeyBind(userKeyBinds: Record<string, string>) {
  return userKeyBinds.browseNotes || defaultKeyMaps.browseNotes;
}

export function getNewNoteKeyBind(userKeyBinds: Record<string, string>) {
  return userKeyBinds.newNote || defaultKeyMaps.newNote;
}

function getKeymaps(userKeyBinds: Record<string, string>) {
  return [
    ...Object.entries(userKeyBinds)
      .filter(([command]) => !!commands[command])
      .map(([command, keys]) => {
        return cmd(keys, command as Command);
      }),
    ...DEFAULT_KEYMAPS.filter((keymap) => {
      return (
        !!commands[keymap.command] &&
        (!userKeyBinds[keymap.command] || userKeyBinds[keymap.command] === keymap.keys)
      );
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
  const keybinds = getKeymaps(userKeyBinds);

  return [
    conditionalIndentKeymap,
    Prec.highest(
      keymap.of(
        keybinds.map((k) => {
          return {
            key: k.keys,
            run: (view) => {
              const command = commands[k.command];

              if (!command) {
                return false;
              }

              return command.run({ editor, view });
            }
          };
        })
      )
    )
  ];
}
