import { getNoteBlockFromPos } from "../../block/utils";
import { foldedRanges, foldEffect, unfoldEffect } from "@codemirror/language";
import { EditorCommand } from "../types";
import { EditorView } from "@codemirror/view";
import { foldState } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

export const toggleBlockFold: EditorCommand = ({ view, editor }) => {
  const { state, dispatch } = view;
  const pos = state.selection.main.head;

  const block = getNoteBlockFromPos(state, pos);

  const folds = foldedRanges(state);

  let isFolded = false;

  const from = state.doc.lineAt(block.content.from).to;
  const to = block.content.to;

  folds.between(from, to, () => {
    isFolded = true;
    return false;
  });

  if (from < to) {
    dispatch({
      effects: isFolded ? unfoldEffect.of({ from, to }) : foldEffect.of({ from, to })
    });
  }

  setTimeout(() => {
    const folds = foldedRanges(view.state);

    const folded: Array<{ from: number; to: number }> = [];

    folds.between(0, view.state.doc.length, (from, to) => {
      folded.push({ from, to });
    });

    editor?.storeFoldedRanges(folded);
  }, 0);

  return true;
};
