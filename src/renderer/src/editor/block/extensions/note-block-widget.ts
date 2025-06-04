import { Decoration, EditorView } from "@codemirror/view";
import { Range, EditorState, RangeSet, StateField } from "@codemirror/state";

import { NoteBlockStart } from "../widgets/NoteBlockStart";
import { blockState } from "../state/block-state";

function decorate(state: EditorState) {
  const widgets: Range<Decoration>[] = [];

  state.field(blockState).forEach((block) => {
    const delimiter = block.delimiter;
    const deco = Decoration.replace({
      widget: new NoteBlockStart(delimiter.from === 0 ? true : false),
      inclusive: true,
      block: true,
      side: 0
    });

    widgets.push(
      deco.range(delimiter.from === 0 ? delimiter.from : delimiter.from + 1, delimiter.to - 1)
    );
  });

  return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none;
}

export const noteBlockWidget = () => {
  const noteBlockStartField = StateField.define({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      // if widgets are empty it likely means we didn't get a parsed syntax tree, and then we want to update
      // the decorations on all updates (and not just document changes)
      if (transaction.docChanged || widgets.size === 0) {
        return decorate(transaction.state);
      }

      return widgets;
    },
    provide(field) {
      return EditorView.decorations.from(field);
    }
  });

  return noteBlockStartField;
};
