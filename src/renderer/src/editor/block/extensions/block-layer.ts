import { layer, RectangleMarker } from "@codemirror/view";
import { blockState } from "../state/block-state";

export const blockLayer = layer({
  above: false,

  markers(view) {
    const markers: RectangleMarker[] = [];
    let idx = 0;

    function rangesOverlaps(
      range1: { from: number; to: number },
      range2: { from: number; to: number }
    ) {
      return range1.from <= range2.to && range2.from <= range1.to;
    }

    const blocks = view.state.field(blockState);

    blocks.forEach((block) => {
      // make sure the block is visible
      if (!view.visibleRanges.some((range) => rangesOverlaps(block.content, range))) {
        idx++;
        return;
      }

      // view.coordsAtPos returns null if the editor is not visible
      const fromCoordsTop =
        view.coordsAtPos(Math.max(block.content.from, view.visibleRanges[0].from))?.top || 0;

      const toCoordsBottom =
        view.coordsAtPos(
          Math.min(block.content.to, view.visibleRanges[view.visibleRanges.length - 1].to)
        )?.bottom || 0;

      markers.push(
        new RectangleMarker(
          idx++ % 2 == 0 ? "block-even" : "block-odd",
          0,
          // Change "- 0 - 6" to "+ 1 - 6" on the following line, and "+ 1 + 13" to "+2 + 13" on the line below,
          // in order to make the block backgrounds to have no gap between them
          fromCoordsTop - (view.documentTop - view.documentPadding.top) - 1 - 6,
          null, // width is set to 100% in CSS
          toCoordsBottom - fromCoordsTop + 15
        )
      );
    });
    return markers;
  },

  update(update) {
    return update.docChanged || update.viewportChanged;
  },

  class: "editor-blocks-layer"
});
