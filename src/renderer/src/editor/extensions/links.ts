import { Decoration, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { MatchDecorator } from "@codemirror/view";
import { RangeSet } from "@codemirror/state";
import { APPNAME } from "@common/constants";
import { getCM } from "@replit/codemirror-vim";

const className = `${APPNAME}-link`;

const linkMatcher = new MatchDecorator({
  regexp: /https?:\/\/[^\s)]+/gi,
  decoration: () => {
    return Decoration.mark({
      class: className,
      attributes: { title: "⌘ + Click to open link" }
    });
  }
});

const links = ViewPlugin.fromClass(
  class {
    links: RangeSet<Decoration>;

    constructor(view: EditorView) {
      this.links = linkMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.links = linkMatcher.updateDeco(update, this.links);
    }
  },
  {
    decorations: (instance) => instance.links,
    eventHandlers: {
      click: (e) => {
        const target = e.target as HTMLElement;

        if (!target) return;

        const isLinkClick =
          e.metaKey && target.closest(`.${className}`)?.classList.contains(className);

        if (!isLinkClick || !target.textContent) return;

        const linkEl = document.createElement("a");

        linkEl.href = target.textContent;
        linkEl.target = "_blank";
        linkEl.click();
        linkEl.remove();
      }
    }
  }
);

const metaKey = EditorView.domEventHandlers({
  mousemove(event, view) {
    if (event.metaKey) {
      view.dom.classList.add("cm-meta-hover");
    } else {
      view.dom.classList.remove("cm-meta-hover");
    }
  },
  keydown(event, view) {
    if (event.metaKey) {
      view.dom.classList.add("cm-meta-hover");
    }
  },
  keyup(event, view) {
    if (!event.metaKey) {
      view.dom.classList.remove("cm-meta-hover");
    }
  },
  blur(_, view) {
    view.dom.classList.remove("cm-meta-hover");
  }
});

const pasteHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData("text/plain");

    if (!/^https?:\/\//.test(text)) return;

    const range = getSelectionRange(view);
    let from = range.from;
    let to = range.to;
    const isEntireLineSelected = range.isEntireLineSelected;

    if (from === null || to === null) return;

    // Only handle if selection is on a single line
    const fromLine = view.state.doc.lineAt(from);
    const toLine = view.state.doc.lineAt(to);

    if (fromLine.number !== toLine.number) return;

    let selectedText: string;

    // FIXME: Wasn't seeing a way in the vim state to get the correct selection range when selecting entire lines
    if (isEntireLineSelected) {
      selectedText = fromLine.text;
      from = fromLine.from;
      to = from + fromLine.length;
    } else {
      selectedText = view.state.sliceDoc(from, to);
    }

    if (!selectedText) return;

    // remove any existing markdown links from the selected text
    const cleanedText = selectedText.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1");

    const markdownLink = `[${cleanedText}](${text})`;

    // Prevent default paste behavior
    event.preventDefault();

    view.dispatch({
      changes: {
        from,
        to,
        insert: markdownLink
      }
    });
  }
});

// vim visual mode selection is not represented in the main selection,
function getSelectionRange(view: EditorView): {
  from: number | null;
  to: number | null;
  isEntireLineSelected?: boolean;
} {
  const cm = getCM(view);

  if (!cm?.state.vim?.lastSelection?.visualMode) {
    return view.state.selection.main;
  }

  const { headMark, head, anchorMark, anchor } = cm.state.vim.lastSelection;

  if (head.line !== anchor.line) {
    return {
      from: null,
      to: null
    };
  }

  if (headMark.offset && anchorMark.offset && headMark.offset === anchorMark.offset) {
    return {
      from: view.state.selection.main.from,
      to: view.state.selection.main.to,
      isEntireLineSelected: true
    };
  }

  return {
    from: anchorMark.offset,
    to: Math.max(anchorMark.offset || 0, headMark?.offset || 0) + 1
  };
}

export const linksExtension = () => [links, metaKey, pasteHandler];
