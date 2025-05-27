import { Decoration, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { MatchDecorator } from "@codemirror/view";
import { RangeSet } from "@codemirror/state";
import { APPNAME } from "@common/constants";

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

export const linksExtension = () => [links, metaKey];
