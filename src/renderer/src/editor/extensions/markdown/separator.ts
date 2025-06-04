import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType
} from "@codemirror/view";
import { EditorSelection, EditorState, Line, Prec, RangeSetBuilder } from "@codemirror/state";
import { APPNAME } from "@common/constants";
import { getActiveNoteBlock, getBlockFromPos } from "@/editor/block/utils";
import { isInInsertMode } from "../vim";

const separatorRegex = /^---$/gm;

class SeparatorWidget extends WidgetType {
  constructor(private heightlight: boolean) {
    super();
  }

  toDOM() {
    const span = document.createElement("div");
    span.className = `${APPNAME}-separator`;

    if (this.heightlight) {
      span.setAttribute("data-highlight", "true");
    }

    return span;
  }

  ignoreEvent() {
    return false;
  }
}

export const separatorDecorator = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const cursorPositions = view.state.selection.ranges.map((r) => r.head);
      const text = view.state.doc.toString();

      for (const match of text.matchAll(separatorRegex)) {
        const fullMatch = match[0];
        const index = match.index!;
        const from = index;
        const to = index + fullMatch.length;

        const block = getBlockFromPos(view.state, from);

        if (!block || block.language.name !== "markdown") continue;

        const cursorInside = cursorPositions.some((pos) => pos >= from && pos <= to);

        builder.add(
          from,
          to,
          Decoration.replace({
            widget: new SeparatorWidget(cursorInside),
            inclusive: false
          })
        );
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) => {
      return EditorView.atomicRanges.of((view) => {
        const decorations = view.plugin(plugin)?.decorations;
        return decorations || Decoration.none;
      });
    }
  }
);

const deleteSeparatorOnBackspaceHandler = {
  key: "Backspace",
  run(view: EditorView) {
    const { state } = view;
    const { from } = state.selection.main;

    const currentLine = state.doc.lineAt(from);
    const isBeginningOfLine = currentLine.from === from;

    let line: Line | null = null;

    if (isBeginningOfLine) {
      const _line = state.doc.lineAt(from - 1);
      const isPreviousLineSeparator = _line.text.match(separatorRegex);

      if (isPreviousLineSeparator?.[0] && currentLine.text.trim().length) {
        line = _line;
      }
    } else {
      const _line = state.doc.lineAt(from);
      const isLineASeparator = _line.text.match(separatorRegex);

      if (isLineASeparator?.[0]) {
        line = _line;
      }
    }

    if (!line) return false;

    const block = getActiveNoteBlock(state);

    if (block.language.name !== "markdown") return false;

    view.dispatch({
      changes: { from: line.from, to: line.to + 1 },
      selection: EditorSelection.cursor(line.from)
    });

    return true;
  }
};

export const moveCursorToNewLineAfterAddingSeparator = EditorState.transactionFilter.of((tr) => {
  if (!isInInsertMode(tr.startState)) return tr;

  if (!tr.docChanged && tr.newSelection) {
    const line = tr.state.doc.lineAt(tr.newSelection.main.head);

    if (line.text === "---" && tr.newSelection.main.head === line.to) {
      return [
        tr,
        {
          selection: EditorSelection.create(
            [EditorSelection.range(line.to, line.to)],
            tr.selection?.mainIndex
          )
        }
      ];
    }
  }

  const changes: Array<{ from: number; to: number; insert: string }> = [];

  let cursorPosition: number | null = null;

  tr.changes.iterChanges((from) => {
    const line = tr.state.doc.lineAt(from);

    if (line.text !== "---") return;

    cursorPosition = line.to;

    changes.push({
      from: line.to,
      to: line.to,
      insert: "\n"
    });
  });

  if (!changes.length || !cursorPosition) return tr;

  return [
    tr,
    {
      changes,
      selection: EditorSelection.create(
        [EditorSelection.range(cursorPosition, cursorPosition)],
        tr.selection?.mainIndex
      )
    }
  ];
});

export const separator = [
  separatorDecorator,
  moveCursorToNewLineAfterAddingSeparator,
  Prec.high(keymap.of([deleteSeparatorOnBackspaceHandler]))
];
