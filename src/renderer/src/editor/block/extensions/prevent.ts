import { EditorSelection, EditorState, Transaction } from "@codemirror/state";
import { editorEvent } from "../../annotation";
import { firstBlockDelimiterSize } from "../block-parsing";
import { blockState } from "../state/block-state";
import { isInInsertMode } from "@/editor/extensions/vim";

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
  const blocks = tr.startState.field(blockState);

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

    /**
     * When a selection change occurs in normal mode and it enters a delimiter, we should move it outside of the delimiter.
     * This occurs when deleeting a line
     **/
    if (!isInInsertMode(tr.state)) {
      blocks.forEach((block) => {
        if (range.from > block.delimiter.from && range.from < block.delimiter.to) {
          changed = true;

          from = block.delimiter.to;
          to = block.delimiter.to;
        }
      });
    }

    return EditorSelection.range(from, to);
  });

  if (changed && newRanges) {
    return [tr, { selection: EditorSelection.create(newRanges, tr.selection?.mainIndex) }];
  }

  return tr;
});

export const preventDanglingDelimiter = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged || isInInsertMode(tr.startState)) {
    return tr;
  }

  const blocks = tr.startState.field(blockState);
  const changes: Array<{ from: number; to: number; insert: string }> = [];

  tr.changes.iterChanges((fromA, toA) => {
    const deletedText = tr.startState.doc.sliceString(fromA, toA);
    const isDeletion = deletedText.length > 0;

    if (!isDeletion) return;

    blocks.forEach((block) => {
      const isEnteringFromTop = toA > block.delimiter.from && toA < block.delimiter.to;
      // if you're deleting from the top then you probably want to delete the first line of the next block
      if (isEnteringFromTop) {
        changes.push({
          from: fromA,
          to: block.delimiter.from,
          insert: ""
        });
      }

      const isDeletingFromInside = fromA > block.delimiter.from && fromA < block.delimiter.to;

      if (isDeletingFromInside) {
        changes.push({
          from: block.content.from,
          to: block.content.to,
          insert: ""
        });
      }
    });
  });

  if (!changes.length) return tr;

  // returning just changes here because we want to completely overwrite the transaction
  return { changes };
});
