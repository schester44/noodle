import { StateField } from "@codemirror/state";
import { getBlocks } from "../block-parsing";

export const blockState = StateField.define({
  create(state) {
    return getBlocks(state);
  },
  update(blocks, transaction) {
    // if blocks are empty it likely means we didn't get a parsed syntax tree, and then we want to update
    // the blocks on all updates (and not just document changes)
    if (transaction.docChanged || blocks.length === 0) {
      return getBlocks(transaction.state);
    }

    return blocks;
  }
});
