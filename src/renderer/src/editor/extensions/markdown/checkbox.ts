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
import { darkPalette } from "@/editor/base-theme";
import { getActiveNoteBlock } from "@/editor/block/utils";

class CheckboxWidget extends WidgetType {
  constructor(
    private checked: boolean,
    private pos: number,
    private severity: number
  ) {
    super();
  }

  equals(other: CheckboxWidget) {
    return this.checked === other.checked && this.pos === other.pos;
  }

  toDOM(): HTMLElement {
    const input = document.createElement("input");

    input.type = "checkbox";
    input.checked = this.checked;
    input.className = `cm-checkbox cm-checkbox-${this.severity}`;

    return input;
  }

  ignoreEvent() {
    return false;
  }
}

function toggleCheckbox(view: EditorView, pos: number) {
  const content = view.state.doc.sliceString(pos, pos + 5);

  const isChecked = content.includes("[x]") || content.includes("[X]");

  const change = isChecked
    ? { from: pos, to: pos + 5, insert: "- [ ]" }
    : { from: pos, to: pos + 5, insert: "- [x]" };

  view.dispatch({ changes: change });
  return true;
}

const severityMap = {
  high: 3,
  h: 3,
  medium: 2,
  med: 2,
  m: 2,
  low: 1,
  l: 1,
  default: 0
};

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

              const possibleSeverity = view.state.doc.sliceString(node.to, node.to + 6);

              const checkboxPriorityRegex = /!(h(?![a-zA-Z])|m(?![a-zA-Z])|l(?![a-zA-Z])) /g;

              const match = possibleSeverity.match(checkboxPriorityRegex);

              const severity = match ? match[0].slice(1).trim() : "default";

              const severityLength = match ? match[0].length : 0;

              builder.add(
                // -2 accounts for the "- " dashed prefix in the list
                node.from - 2,
                node.to + severityLength,
                Decoration.replace({
                  widget: new CheckboxWidget(checked, node.from - 2, severityMap[severity]),
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
    decorations: (v) => v.decorations,
    provide: (plugin) => {
      // TODO: This works in insert mode but not in normal. will need to use a transactionFilter when in normal mode
      return EditorView.atomicRanges.of((view) => {
        const decorations = view.plugin(plugin)?.decorations;
        return decorations || Decoration.none;
      });
    },
    eventHandlers: {
      mousedown: (e, view) => {
        const target = e.target as HTMLElement;

        if (target.nodeName !== "INPUT" || !target.classList.contains("cm-checkbox")) return;

        return toggleCheckbox(view, view.posAtDOM(target));
      }
    }
  }
);

const autoInsertCheckboxWidget = EditorView.inputHandler.of((view, from, _to, text) => {
  // Only attempt to insert a checkbox when pressing space
  if (text === " ") {
    const block = getActiveNoteBlock(view.state);

    if (block.language.name !== "markdown") return false;

    const line = view.state.doc.lineAt(from);
    const lineText = line.text;

    const regex = /\s*\[(?:x|X)?\]/;

    const match = lineText.match(regex);

    const checkbox = match?.[0].trimStart();

    const isIncompleteCheckbox = checkbox === "[]";
    const isCompletedCheckbox = checkbox && !isIncompleteCheckbox;

    if (isIncompleteCheckbox || isCompletedCheckbox) {
      const alreadyHasCheckbox = lineText.includes("- [ ]") || lineText.includes("- [x]");

      if (alreadyHasCheckbox) return false; // Don't insert if there's already a checkbox

      const matchLen = checkbox.length;

      const insertAt = from - matchLen;

      view.dispatch({
        changes: {
          // isnert at the start of the match
          from: insertAt,
          // replace the entire match with a new markdown checkbox
          to: insertAt + (isCompletedCheckbox ? matchLen : matchLen),
          insert: isCompletedCheckbox ? "- [x] " : "- [ ] "
        },
        selection: { anchor: insertAt + 6 }
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
      const block = getActiveNoteBlock(state);
      if (block.language.name !== "markdown") return false;

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

export const checkboxDarkTheme = EditorView.theme({
  ".cm-checkbox": {
    appearance: "none",
    width: "0.75rem",
    height: "0.75rem",
    background: "transparent",
    outline: `1.5px solid ${darkPalette.dullGreen}`,
    borderRadius: "4px"
  },
  ".cm-checkbox:checked": {
    backgroundColor: darkPalette.dullGreen,
    border: "1px solid black"
  },
  // High
  ".cm-checkbox.cm-checkbox-3": {
    outlineColor: darkPalette.red
  },
  ".cm-checkbox.cm-checkbox-3:checked": {
    backgroundColor: darkPalette.red
  },
  // Medium
  ".cm-checkbox.cm-checkbox-2": {
    outlineColor: darkPalette.orange
  },
  ".cm-checkbox.cm-checkbox-2:checked": {
    backgroundColor: darkPalette.orange
  },
  // Low
  ".cm-checkbox.cm-checkbox-1": {
    outlineColor: darkPalette.yellow
  },
  ".cm-checkbox.cm-checkbox-1:checked": {
    backgroundColor: darkPalette.yellow
  }
});

export function checkboxExtension() {
  return [
    checkboxPlugin,
    autoInsertCheckboxWidget,
    Prec.highest(keymap.of([deleteCheckboxOnBackspaceHandler])),
    checkboxDarkTheme
  ];
}
