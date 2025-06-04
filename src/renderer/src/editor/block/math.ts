import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Decoration } from "@codemirror/view";
import { RangeSet, RangeSetBuilder } from "@codemirror/state";

import { transactionsHasAnnotation, CURRENCIES_LOADED } from "../annotation";
import { getNoteBlockFromPos } from "./utils";
import { MathResult } from "./widgets/MathResult";
import { parser as mathParser, format as mathFormat } from "mathjs";

function mathDeco(view: EditorView) {
  const mathParsers = new WeakMap();
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
      const block = getNoteBlockFromPos(view.state, pos);

      if (block && block.language.name == "math") {
        // get math.js parser and cache it for this block
        const { parser: _parser, prev } = mathParsers.get(block) || {};
        let parser = _parser;

        if (!parser) {
          parser = mathParser();
          mathParsers.set(block, { parser, prev });
        }

        let result: string | undefined;

        try {
          parser.set("prev", prev);
          result = parser.evaluate(line.text);
          if (result !== undefined) {
            mathParsers.set(block, { parser, prev: result });
          }
        } catch {
          // these errors will occur for invalid math expressions
          // console.log("🪵 e", e);
          // suppress any errors
        }

        // if we got a result from math.js, add the result decoration
        if (result !== undefined) {
          const format = parser.get("format");

          let resultWidget: MathResult | undefined;

          if (typeof result === "string") {
            resultWidget = new MathResult(result, result);
          } else if (format !== undefined && typeof format === "function") {
            try {
              resultWidget = new MathResult(format(result), format(result));
            } catch {
              // console.log("🪵 e", e);
            }
          }

          if (resultWidget === undefined) {
            resultWidget = new MathResult(
              mathFormat(result, {
                precision: 8,
                upperExp: 8,
                lowerExp: -6
              }),
              mathFormat(result, {
                notation: "fixed"
              })
            );
          }
          builder.add(
            line.to,
            line.to,
            Decoration.widget({
              widget: resultWidget,
              side: 1
            })
          );
        }
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

export const mathBlock = ViewPlugin.fromClass(
  class {
    decorations: RangeSet<Decoration>;

    constructor(view: EditorView) {
      this.decorations = mathDeco(view);
    }

    update(update: ViewUpdate) {
      // If the document changed, the viewport changed, or the transaction was annotated with the CURRENCIES_LOADED annotation,
      // update the decorations. The reason we need to check for CURRENCIES_LOADED annotations is because the currency rates are
      // updated asynchronously
      if (
        update.docChanged ||
        update.viewportChanged ||
        transactionsHasAnnotation(update.transactions, CURRENCIES_LOADED)
      ) {
        this.decorations = mathDeco(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
);
