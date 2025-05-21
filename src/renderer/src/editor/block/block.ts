import { lineNumbers } from "@codemirror/view";

import { atomicNoteBlock } from "./extensions/atomic-note-block";
import { blockLayer } from "./extensions/block-layer";
import { blockLineNumbers } from "./extensions/block-line-numbers";
import { noteBlockWidget } from "./extensions/note-block-widget";
import { blockState } from "./state/block-state";
import {
  preventFirstBlockFromBeingDeleted,
  preventSelectionBeforeFirstBlock
} from "./extensions/prevent";
import { mathBlock } from "./math";

export const blockExtension = () => {
  return [
    lineNumbers(),
    blockLineNumbers,
    blockState,
    preventFirstBlockFromBeingDeleted,
    preventSelectionBeforeFirstBlock,
    noteBlockWidget(),
    mathBlock,
    atomicNoteBlock,
    blockLayer
  ];
};
