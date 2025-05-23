import { syntaxTree } from "@codemirror/language";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType
} from "@codemirror/view";
import { EditorSelection, Prec, RangeSetBuilder } from "@codemirror/state";

class CheckboxWidget extends WidgetType {
  constructor(
    private checked: boolean,
    private pos: number
  ) {
    super();
  }

  equals(other: CheckboxWidget) {
    return this.checked === other.checked && this.pos === other.pos;
  }

  toDOM(view: EditorView): HTMLElement {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.checked;
    input.className = "cm-checkbox";

    input.addEventListener("click", (event) => {
      const replacement = this.checked ? "- [ ]" : "- [x]";

      view.dispatch({
        changes: {
          from: this.pos,
          to: this.pos + 5,
          insert: replacement
        }
      });

      event.preventDefault();
      event.stopPropagation();
    });

    return input;
  }

  ignoreEvent(event: Event) {
    // Ignore mouse events to prevent selection/focus changes
    return event.type === "mousedown" || event.type === "click";
  }
}

const checkboxPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();

      for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
          from,
          to,
          enter: (node) => {
            if (node.name === "TaskMarker") {
              const text = view.state.doc.sliceString(node.from, node.to);
              const checked = text === "[x]" || text === "[X]";

              builder.add(
                // -2 accounts for the "- " dashed prefix in the list
                node.from - 2,
                node.to,
                Decoration.replace({
                  widget: new CheckboxWidget(checked, node.from - 2),
                  inclusive: false
                })
              );
            }
          }
        });
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations
  }
);

const autoTaskInsertOnEnter = EditorView.inputHandler.of((view, from, _to, text) => {
  // Only attempt to insert a checkbox when pressing space
  if (text === " ") {
    const line = view.state.doc.lineAt(from);
    const lineText = line.text;

    const isCompletedCheckbox = lineText[0] === "[" && lineText[1] === "x" && lineText[2] === "]";

    const isIncompleteCheckbox = lineText[0] === "[" && lineText[1] === "]";

    if (isIncompleteCheckbox || isCompletedCheckbox) {
      view.dispatch({
        changes: {
          from: line.from,
          to: line.from + (isCompletedCheckbox ? 3 : 2),
          insert: isCompletedCheckbox ? "- [x] " : "- [ ] "
        },
        selection: { anchor: line.from + 6 }
      });

      return true;
    }
  }

  return false;
});

const deleteCheckboxOnBackspaceHandler = {
  key: "Backspace",
  run(view: EditorView) {
    const { state } = view;
    const { from } = state.selection.main;

    const line = state.doc.lineAt(from);
    const beforeCursor = state.doc.sliceString(line.from, from);

    const match = beforeCursor.match(/^\s*[-*] \[( |x|X)\] $/);

    if (match) {
      const deleteFrom = line.from;
      const deleteTo = from;

      view.dispatch({
        changes: { from: deleteFrom, to: deleteTo },
        selection: EditorSelection.cursor(deleteFrom)
      });

      return true;
    }

    // Fall back to default backspace behavior
    return false;
  }
};

export function checkboxExtension() {
  return [
    checkboxPlugin,
    autoTaskInsertOnEnter,
    Prec.highest(keymap.of([deleteCheckboxOnBackspaceHandler]))
  ];
}
