import { addNewBlockAfterCurrent } from "./addNewBlockAfterCurrent";
import { addNewBlockBeforeCurrent } from "./addNewBlockBeforeCurrent";
import { addNewBlockAtCursor } from "./addNewBlockAtCursor";
import { selectAll } from "./selectAll";
import { EditorCommand, EditorLessCommand } from "./types";
import { toggleBlockFold } from "./vim/toggleFold";
import { moveLineUp } from "./vim/moveLineUp";
import { moveLineDown } from "./vim/moveLineDown";
import { toggleCheckbox } from "./vim/toggleCheckbox";
import { gotoLastNote } from "./vim/gotoLastNote";

const cmd = (run: EditorCommand, description: string, mode?: "normal" | "insert" | "visual") => ({
  run,
  description,
  modes: mode ? [mode] : undefined
});

const cmdLessContext = (
  run: EditorLessCommand,
  description: string,
  modes: Array<"insert" | "visual" | "normal"> = ["normal"]
) => ({
  run,
  description,
  modes
});

export const commands = {
  selectAll: cmd(selectAll, "Select All"),
  addNewBlockBeforeCurrent: cmd(addNewBlockBeforeCurrent, "Add New Block Before Current"),
  addNewBlockAfterCurrent: cmd(addNewBlockAfterCurrent, "Add New Block After Current"),
  addNewBlockAtCursor: cmd(addNewBlockAtCursor, "Add New Block At Cursor")
};

export type Command = keyof typeof commands;
export type VimCommand = keyof typeof vimCommands;

export const vimCommands = {
  toggleBlockFold: cmdLessContext(toggleBlockFold, "Toggle Block Fold", ["normal"]),
  toggleCheckbox: cmdLessContext(toggleCheckbox, "Toggle Checkbox", ["normal"]),
  moveLineUp: cmdLessContext(moveLineUp, "Move Line Up", ["normal"]),
  moveLineDown: cmdLessContext(moveLineDown, "Move Line Down", ["normal"]),
  gotoLastNote: cmdLessContext(gotoLastNote, "Go to Last Note", ["normal"])
};

export const POSSIBLE_COMMANDS = Object.keys(commands).concat(Object.keys(vimCommands)) as Array<
  Command | VimCommand
>;
