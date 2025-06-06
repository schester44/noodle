import { EditorSelection } from "@codemirror/state";
import { getActiveNoteBlock, getBlockDelimiter } from "../block/utils";
import { EditorCommand } from "./types";

export const addNewBlockAfterCurrent: EditorCommand = ({ view, editor }) => {
  const { state, dispatch } = view;

  if (state.readOnly || !editor) return false;

  const block = getActiveNoteBlock(state);
  const delimiter = getBlockDelimiter(block.language.name, block.language.auto);

  dispatch(
    state.update(
      {
        changes: {
          from: block.content.to,
          insert: delimiter
        },
        selection: EditorSelection.cursor(block.content.to + delimiter.length)
      },
      {
        scrollIntoView: true,
        userEvent: "input"
      }
    )
  );

  return true;
};
