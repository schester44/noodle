import { EditorSelection, EditorState, Transaction } from "@codemirror/state";
import { editorEvent } from "../../annotation";
import { firstBlockDelimiterSize } from "../block-parsing";
import { blockState } from "../state/block-state";

export const preventFirstBlockFromBeingDeleted = EditorState.changeFilter.of((tr) => {
  const protect: number[] = [];

  if (!tr.annotation(editorEvent) && firstBlockDelimiterSize) {
    protect.push(0, firstBlockDelimiterSize);
  }

  const userEvent = tr.annotation(Transaction.userEvent);

  // if the transaction is a search and replace, we want to protect all block delimiters
  if (userEvent === "input.replace" || userEvent === "input.replace.all") {
    const blocks = tr.startState.field(blockState);

    blocks.forEach((block) => {
      protect.push(block.delimiter.from, block.delimiter.to);
    });
  }

  if (protect.length > 0) {
    return protect;
  }

  return true;
});

/**
 * Transaction filter to prevent the selection from being before the first block
 */
export const preventSelectionBeforeFirstBlock = EditorState.transactionFilter.of((tr) => {
  if (!firstBlockDelimiterSize || tr.annotation(editorEvent)) {
    return tr;
  }

  let changed = false;
  const newRanges = tr.selection?.ranges.map((range) => {
    let from = range.from;
    let to = range.to;

    if (firstBlockDelimiterSize && from < firstBlockDelimiterSize) {
      from = firstBlockDelimiterSize;
      changed = true;
    }

    if (firstBlockDelimiterSize && to < firstBlockDelimiterSize) {
      to = firstBlockDelimiterSize;
      changed = true;
    }

    return EditorSelection.range(from, to);
  });

  if (changed && newRanges) {
    return [tr, { selection: EditorSelection.create(newRanges, tr.selection?.mainIndex) }];
  }

  return tr;
});
