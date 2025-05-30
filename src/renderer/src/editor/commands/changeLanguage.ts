import { EditorState } from "@codemirror/state";
import { BlockState } from "../block/block-parsing";

import { EditorView } from "@codemirror/view";
import { editorEvent, LANGUAGE_CHANGE } from "../annotation";
import { getActiveNoteBlock } from "../block/utils";

export function changeLanguageTo(
  state: EditorState,
  dispatch: EditorView["dispatch"],
  block: BlockState,
  language: string,
  auto: boolean
) {
  if (state.readOnly) return false;

  const delimRegex = /^\n∞∞∞[a-z]+?(-a)?\n/g;

  const isMatch = state.doc.sliceString(block.delimiter.from, block.delimiter.to).match(delimRegex);

  if (!isMatch) {
    throw new Error(
      "Invalid delimiter: " + state.doc.sliceString(block.delimiter.from, block.delimiter.to)
    );
  }

  dispatch(
    state.update({
      changes: {
        from: block.delimiter.from,
        to: block.delimiter.to,
        insert: `\n∞∞∞${language}${auto ? "-a" : ""}\n`
      },
      annotations: [editorEvent.of(LANGUAGE_CHANGE)]
    })
  );

  return true;
}

export function changeCurrentBlockLanguage(
  state: EditorState,
  dispatch: EditorView["dispatch"],
  language: string | null,
  auto: boolean
) {
  const block = getActiveNoteBlock(state);

  // if language is null, we only want to change the auto-detect flag
  if (language === null) {
    language = block.language.name;
  }

  changeLanguageTo(state, dispatch, block, language, auto);
}
