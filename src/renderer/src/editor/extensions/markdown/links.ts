import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { APPNAME } from "@common/constants";

// regex to match [label](url)
const markdownLinkRegex = /\[([^\]\n]+)\]\((https?:\/\/[^)\n]+)\)/g;

class MarkdownLinkWidget extends WidgetType {
  constructor(
    private label: string,
    private href: string
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.label;
    span.className = `${APPNAME}-markdown-link`;
    span.setAttribute("data-href", this.href);
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

export const markdownLinkHider = ViewPlugin.fromClass(
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

      for (const match of text.matchAll(markdownLinkRegex)) {
        const fullMatch = match[0];
        const label = match[1];
        const index = match.index!;
        const from = index;
        const to = index + fullMatch.length;

        const cursorInside = cursorPositions.some((pos) => pos >= from && pos <= to);
        if (cursorInside) continue;

        builder.add(
          from,
          to,
          Decoration.replace({
            widget: new MarkdownLinkWidget(label, match[2]),
            inclusive: false
          })
        );
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
    eventHandlers: {
      // "click" would be ideal but it expands the text instead of clicking the link
      mousedown(event) {
        const target = event.target as HTMLElement;

        if (!event.metaKey || !target.classList.contains(`${APPNAME}-markdown-link`)) return;

        const href = target.getAttribute("data-href");

        if (!href) return;

        const linkEl = document.createElement("a");

        linkEl.href = href;
        linkEl.target = "_blank";
        linkEl.click();
        linkEl.remove();
      }
    }
  }
);
