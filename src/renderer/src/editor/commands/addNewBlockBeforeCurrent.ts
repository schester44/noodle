import { getActiveNoteBlock, getBlockDelimiter } from "../block/utils";
import { EditorSelection } from "@codemirror/state";
import { EditorCommand } from "./types";
import { ADD_NEW_BLOCK, editorEvent } from "../annotation";

export const addNewBlockBeforeCurrent: EditorCommand =
  (editor) =>
  ({ state, dispatch }) => {
    if (state.readOnly || !editor) return false;

    const block = getActiveNoteBlock(state);
    const delimiter = getBlockDelimiter(block.language.name, block.language.auto);

    dispatch(
      state.update(
        {
          changes: {
            from: block.delimiter.from,
            insert: delimiter
          },
          selection: EditorSelection.cursor(block.delimiter.from + delimiter.length),
          annotations: [editorEvent.of(ADD_NEW_BLOCK)]
        },
        {
          scrollIntoView: true,
          userEvent: "input"
        }
      )
    );
    return true;
  };
