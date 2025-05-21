import { addNewBlockAfterCurrent } from "./addNewBlockAfterCurrent";
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
  addNewBlockAfterCurrent: cmd(addNewBlockAfterCurrent, "Add New Block After Current")
};

export const vimCommands = {
  toggleBlockFold: cmdLessContext(toggleBlockFold, "Toggle Block Fold")
};
