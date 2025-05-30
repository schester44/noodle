import { BlockState } from "./block-parsing";
import { blockState } from "./state/block-state";
import { EditorState, SelectionRange } from "@codemirror/state";

export function getBlockDelimiter(defaultToken: string, autoDetect: boolean) {
  return `\n∞∞∞${autoDetect ? defaultToken + "-a" : defaultToken}\n`;
}

export function getActiveNoteBlock(state: EditorState): BlockState {
  const range = state.selection.asSingle().ranges[0];

  const block = state
    .field(blockState)
    .find((block) => block.range.from <= range.head && block.range.to >= range.head);

  if (!block) {
    throw new Error("No block found at position " + range.head);
  }

  return block;
}

export function getFirstNoteBlock(state: EditorState): BlockState {
  return state.field(blockState)[0];
}

export function getLastNoteBlock(state: EditorState): BlockState {
  return state.field(blockState)[state.field(blockState).length - 1];
}

export function getNoteBlockFromPos(state: EditorState, pos: number): BlockState {
  const block = state
    .field(blockState)
    .find((block) => block.range.from <= pos && block.range.to >= pos);

  if (!block) {
    throw new Error("No block found at position " + pos);
  }

  return block;
}

export function getSelectionSize(state: EditorState, sel: SelectionRange): number {
  let count = 0;
  let numBlocks = 0;

  for (const block of state.field(blockState)) {
    if (sel.from <= block.range.to && sel.to > block.range.from) {
      count += Math.min(sel.to, block.content.to) - Math.max(sel.from, block.content.from);
      numBlocks++;
    }
  }

  count += (numBlocks - 1) * 2; // add 2 for each block separator

  return count;
}

export function getBlockFromPos(state: EditorState, pos: number): BlockState | null {
  const line = state.doc.lineAt(pos);

  const block = state
    .field(blockState)
    .find((block) => block.content.from <= line.from && block.content.to >= line.from);

  return block || null;
}

export function getBlockLineFromPos(state: EditorState, pos: number) {
  const line = state.doc.lineAt(pos);
  const block = state
    .field(blockState)
    .find((block) => block.content.from <= line.from && block.content.to >= line.from);

  if (block) {
    const firstBlockLine = state.doc.lineAt(block.content.from).number;
    return {
      line: line.number - firstBlockLine + 1,
      col: pos - line.from + 1,
      length: line.length
    };
  }
  return null;
}
