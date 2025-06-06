import { getNoteBlockFromPos } from "../../block/utils";
import { foldedRanges, foldEffect, unfoldEffect } from "@codemirror/language";
import { EditorCommand } from "../types";

export const toggleBlockFold: EditorCommand = ({ view }) => {
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

  return true;
};
