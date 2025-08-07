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
import { EditorSelection, Prec, RangeSetBuilder, Transaction, EditorState } from "@codemirror/state";
import { darkPalette } from "@/editor/base-theme";
import { getActiveNoteBlock } from "@/editor/block/utils";
import { isInInsertMode } from "@/editor/extensions/vim";

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

const checkboxCheckedPlugin = ViewPlugin.fromClass(
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

              if (checked) {
                const line = view.state.doc.lineAt(node.from);

                builder.add(line.from, line.to, Decoration.mark({ class: "cm-task-checked-line" }));
              }
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
              const checkboxFrom = node.from - 2;
              const checkboxTo = node.to + severityLength;

              builder.add(
                // -2 accounts for the "- " dashed prefix in the list
                checkboxFrom,
                checkboxTo,
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
      // Atomic ranges work in insert mode, vim normal mode uses vimCheckboxAtomicFilter
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

// Get checkbox ranges from the current state
function getCheckboxRanges(state: any): Array<{from: number, to: number, textStart: number}> {
  const ranges: Array<{from: number, to: number, textStart: number}> = [];
  
  syntaxTree(state).iterate({
    from: 0,
    to: state.doc.length,
    enter: (node) => {
      if (node.name === "TaskMarker") {
        const line = state.doc.lineAt(node.from);
        const lineText = line.text;
        
        // Check for severity modifiers at the beginning of the line
        const severityRegex = /^\s*!(h|m|l)\s+/;
        const severityMatch = lineText.match(severityRegex);
        const severityLength = severityMatch ? severityMatch[0].length : 0;
        
        // Check for priority after the checkbox
        const possibleSeverity = state.doc.sliceString(node.to, node.to + 6);
        const checkboxPriorityRegex = /!(h(?![a-zA-Z])|m(?![a-zA-Z])|l(?![a-zA-Z])) /g;
        const priorityMatch = possibleSeverity.match(checkboxPriorityRegex);
        const priorityLength = priorityMatch ? priorityMatch[0].length : 0;
        
        // Start from line beginning including any severity modifiers
        const checkboxFrom = line.from;
        // End after the checkbox and any priority markers, plus one space
        const checkboxTo = node.to + priorityLength + 1;
        // Text starts right after the checkbox range
        const textStart = checkboxTo;
        
        ranges.push({ from: checkboxFrom, to: checkboxTo, textStart });
      }
    }
  });
  
  return ranges;
}

// Transaction filter to prevent cursor movement into checkboxes in vim normal mode
const vimCheckboxAtomicFilter = EditorState.transactionFilter.of((tr: Transaction) => {
  // Only apply when entering normal mode or when already in normal mode
  const wasInInsertMode = isInInsertMode(tr.startState);
  const isInNormalMode = !isInInsertMode(tr.state);
  
  // Skip if staying in insert mode
  if (!isInNormalMode) {
    return tr;
  }

  // Check if we have a selection change or we're transitioning from insert to normal mode
  const hasSelectionChange = tr.selection && !tr.selection.eq(tr.startState.selection);
  const isModeTransition = wasInInsertMode && isInNormalMode;
  
  if (!hasSelectionChange && !isModeTransition) {
    return tr;
  }

  // Use the final state after all changes to get current checkbox ranges
  const finalState = tr.state;
  const checkboxRanges = getCheckboxRanges(finalState);
  if (checkboxRanges.length === 0) {
    return tr;
  }

  const newSelection = tr.selection || tr.startState.selection;
  let needsAdjustment = false;
  const adjustedRanges = newSelection.ranges.map(range => {
    const pos = range.head;
    
    // Check if cursor is trying to move into any checkbox range
    for (const checkboxRange of checkboxRanges) {
      // If cursor is anywhere within the checkbox range (including at the very beginning)
      if (pos >= checkboxRange.from && pos < checkboxRange.to) {
        needsAdjustment = true;
        // Move cursor to the start of the actual text content
        return EditorSelection.range(checkboxRange.textStart, checkboxRange.textStart);
      }
    }
    
    return range;
  });

  if (needsAdjustment) {
    return [tr, { selection: EditorSelection.create(adjustedRanges) }];
  }
  
  return tr;
});

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
  },
  ".cm-task-checked-line": {
    opacity: 0.4,
    fontStyle: "italic"
  }
});

export function checkboxExtension() {
  return [
    checkboxPlugin,
    checkboxCheckedPlugin,
    autoInsertCheckboxWidget,
    Prec.highest(keymap.of([deleteCheckboxOnBackspaceHandler])),
    vimCheckboxAtomicFilter,
    checkboxDarkTheme
  ];
}
