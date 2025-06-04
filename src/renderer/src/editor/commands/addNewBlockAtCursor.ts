import { getActiveNoteBlock, getBlockDelimiter } from "../block/utils";
import { EditorCommand } from "./types";

export const addNewBlockAtCursor: EditorCommand =
  (editor) =>
  ({ state, dispatch }) => {
    if (state.readOnly || !editor) return false;

    if (state.readOnly) return false;

    const currentBlock = getActiveNoteBlock(state);

    const delimiter = getBlockDelimiter(currentBlock.language.name, currentBlock.language.auto);

    dispatch(state.replaceSelection(delimiter), {
      scrollIntoView: true,
      userEvent: "input"
    });

    return true;
  };
