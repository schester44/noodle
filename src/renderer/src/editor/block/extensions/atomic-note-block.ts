import { Decoration, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { blockState } from "../state/block-state";
import { RangeSet, RangeSetBuilder } from "@codemirror/state";

const decoration = Decoration.line({
  attributes: { class: "atomic-note-range" }
});

/**
 * These atomic ranges prevent the cursor from moving into the delimiter line
 */
function atomicRanges(view: EditorView): RangeSet<Decoration> {
  const builder = new RangeSetBuilder<Decoration>();

  view.state.field(blockState).forEach((block) => {
    builder.add(block.delimiter.from, block.delimiter.to, decoration);
  });

  return builder.finish();
}

export const atomicNoteBlock = ViewPlugin.fromClass(
  class {
    atomicRanges: RangeSet<Decoration>;

    constructor(view: EditorView) {
      this.atomicRanges = atomicRanges(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.atomicRanges = atomicRanges(update.view);
      }
    }
  },
  {
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        const v = view.plugin(plugin);

        if (v) {
          return v.atomicRanges;
        }

        console.log("[AtomicNoteBlock] No plugin found");

        // FIXME: This is mostly here to make typescript happy. not sure when this would occur but logging to keep an eye on it.
        return atomicRanges(view);
      })
  }
);
