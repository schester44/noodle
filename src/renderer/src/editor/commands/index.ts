import { addNewBlockAfterCurrent } from "./addNewBlockAfterCurrent";
import { addNewBlockBeforeCurrent } from "./addNewBlockBeforeCurrent";
import { addNewBlockAtCursor } from "./addNewBlockAtCursor";
import { selectAll } from "./selectAll";
import { EditorCommand } from "./types";
import { toggleBlockFold } from "./vim/toggleFold";
import { moveLineUp } from "./vim/moveLineUp";
import { moveLineDown } from "./vim/moveLineDown";
import { toggleCheckbox } from "./vim/toggleCheckbox";
import { gotoLastNote } from "./vim/gotoLastNote";
import { createNewDailyNote } from "./editor/createNewDailyNote";
import { createNewNote } from "./editor/createNewNote";
import { startPrompt } from "./startPrompt";

const cmd = (
  run: EditorCommand,
  description: string,
  modes?: Array<"normal" | "insert" | "visual">
) => ({
  run,
  description,
  modes
});

export const commands = {
  selectAll: cmd(selectAll, "Select All"),
  addNewBlockBeforeCurrent: cmd(addNewBlockBeforeCurrent, "Add New Block Before Current"),
  addNewBlockAfterCurrent: cmd(addNewBlockAfterCurrent, "Add New Block After Current"),
  addNewBlockAtCursor: cmd(addNewBlockAtCursor, "Add New Block At Cursor"),
  newDailyNote: cmd(createNewDailyNote, "Create New Daily Note"),
  newNote: cmd(createNewNote, "Create New Note"),
  startPrompt: cmd(startPrompt, "Start Prompt", ["normal", "insert"]),
  // this is a placeholder, we don't actually call this function. its handled by tinykeys in App.tsx
  // FIXME: Need an easy way to define commands that are not to be run by CodeMirror
  browseNotes: cmd(() => true, "Browse Notes")
};

export type Command = keyof typeof commands;
export type VimCommand = keyof typeof vimCommands;

export const vimCommands = {
  toggleBlockFold: cmd(toggleBlockFold, "Toggle Block Fold", ["normal"]),
  toggleCheckbox: cmd(toggleCheckbox, "Toggle Checkbox", ["normal"]),
  moveLineUp: cmd(moveLineUp, "Move Line Up", ["normal"]),
  moveLineDown: cmd(moveLineDown, "Move Line Down", ["normal"]),
  gotoLastNote: cmd(gotoLastNote, "Go to Last Note", ["normal"])
};

export const POSSIBLE_COMMANDS = Object.keys(commands).concat(Object.keys(vimCommands)) as Array<
  Command | VimCommand
>;
