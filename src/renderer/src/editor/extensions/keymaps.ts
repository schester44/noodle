import { EditorInstance } from "../editor";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { commands, vimCommands } from "../commands";
import { Vim } from "@replit/codemirror-vim";
import { indentWithTab } from "@codemirror/commands";
import { ghostTextValueField } from "./ghost-text";

const cmd = (key: string, command: keyof typeof commands) => ({ key, command });
const vimcmd = (key: string, command: keyof typeof vimCommands) => ({ key, command });

const DEFAULT_KEYMAPS = [
  cmd("Mod-a", "selectAll"),
  cmd("Mod-Enter", "addNewBlockAtCursor"),
  cmd("Mod-Shift-Enter", "addNewBlockAfterCurrent"),
  cmd("Mod-Shift-Backspace", "addNewBlockBeforeCurrent")
];

const DEFAULT_VIM_COMMANDS = [vimcmd("zb", "toggleBlockFold")];

DEFAULT_VIM_COMMANDS.forEach((k) => {
  Vim.defineAction(k.command, (cm) => {
    const view = cm.cm6;
    if (!view) return;

    const command = vimCommands[k.command];

    return command.run(view);
  });

  Vim.mapCommand(k.key, "action", k.command, [], {});
});

// Only add the indent with tab keymap if there is no ghost text
const conditionalIndentKeymap = keymap.compute([ghostTextValueField], (state) => {
  const ghostValue = state.field(ghostTextValueField, false);

  return !ghostValue ? [indentWithTab] : [];
});

export function keymapExtension({ editor }: { editor: EditorInstance }) {
  return [
    conditionalIndentKeymap,
    Prec.highest(
      keymap.of(
        DEFAULT_KEYMAPS.map((k) => {
          return {
            key: k.key,
            run: (view) => {
              const command = commands[k.command];
              console.log(`Running command: ${k.command}`, k.key);

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
