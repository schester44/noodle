import { addNewBlockAfterCurrent } from "./addNewBlockAfterCurrent";
import { addNewBlockBeforeCurrent } from "./addNewBlockBeforeCurrent";
import { addNewBlockAtCursor } from "./addNewBlockAtCursor";
import { selectAll } from "./selectAll";
import { EditorCommand, EditorLessCommand } from "./types";
import { toggleBlockFold } from "./vim/toggleFold";

const cmd = (run: EditorCommand, description: string) => ({
  run,
  description
});

const cmdLessContext = (run: EditorLessCommand, description: string) => ({
  run,
  description
});

export const commands = {
  selectAll: cmd(selectAll, "Select All"),
  addNewBlockBeforeCurrent: cmd(addNewBlockBeforeCurrent, "Add New Block Before Current"),
  addNewBlockAfterCurrent: cmd(addNewBlockAfterCurrent, "Add New Block After Current"),
  addNewBlockAtCursor: cmd(addNewBlockAtCursor, "Add New Block At Cursor")
};

export const vimCommands = {
  toggleBlockFold: cmdLessContext(toggleBlockFold, "Toggle Block Fold")
};
