import { EditorSelection } from "@codemirror/state";
import { getActiveNoteBlock } from "../block/utils";
import { editorEvent } from "../annotation";
import { EditorCommand } from "./types";

function getBlockDelimiter(defaultToken: string, autoDetect: boolean) {
  return `\n∞∞∞${autoDetect ? defaultToken + "-a" : defaultToken}\n`;
}

export const addNewBlockAfterCurrent: EditorCommand =
  (editor) =>
  ({ state, dispatch }) => {
    if (state.readOnly || !editor) return false;

    const block = getActiveNoteBlock(state);
    const delimText = getBlockDelimiter(editor.defaultBlockToken, editor.defaultBlockAutoDetect);

    dispatch(
      state.update(
        {
          changes: {
            from: block.content.to,
            insert: delimText
          },
          selection: EditorSelection.cursor(block.content.to + delimText.length),
          annotations: [editorEvent.of("ADD_NEW_BLOCK")]
        },
        {
          scrollIntoView: true,
          userEvent: "input"
        }
      )
    );

    return true;
  };
