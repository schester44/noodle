import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType, keymap } from "@codemirror/view";
import { isInInsertMode } from "./vim";

export const setGhostTextEffect = StateEffect.define<string>();

export const setShouldTriggerEffect = StateEffect.define<boolean>();

export const shouldTriggerCompletionField = StateField.define<boolean>({
  create: () => true,
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setShouldTriggerEffect)) return e.value;
    }
    return value;
  }
});

export const ghostTextValueField = StateField.define<string>({
  create: () => "",
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setGhostTextEffect)) return e.value;
    }

    if (tr.docChanged || tr.selection) return "";
    return value;
  }
});

const ghostTextField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    let text: string | null = null;

    for (const e of tr.effects) {
      if (e.is(setGhostTextEffect)) {
        text = e.value;
        break;
      }
    }

    if (text !== null) {
      if (text === "") return Decoration.none;
      const builder = new RangeSetBuilder<Decoration>();
      const pos = tr.state.selection.main.head;

      if (!isInInsertMode(tr.state)) return Decoration.none;

      builder.add(pos, pos, ghostDecoration(text));
      return builder.finish();
    }

    if (tr.docChanged || tr.selection) return Decoration.none;
    return deco;
  },

  provide: (f) => EditorView.decorations.from(f)
});

class GhostTextWidget extends WidgetType {
  txt: string;
  constructor(private readonly text: string) {
    super();
    this.txt = text;
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.txt;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    span.style.fontStyle = "italic";
    span.style.whiteSpace = "pre";
    return span;
  }
}

function ghostDecoration(text: string): Decoration {
  return Decoration.widget({
    side: 1,
    widget: new GhostTextWidget(text)
  });
}

const clearGhostTextOnEscape = keymap.of([
  {
    key: "Escape",
    preventDefault: false,
    run(view: EditorView) {
      const ghost = view.state.field(ghostTextValueField, false);
      if (!ghost) return false;

      view.dispatch({
        effects: [setGhostTextEffect.of(""), setShouldTriggerEffect.of(false)]
      });

      return true;
    }
  }
]);

const acceptGhostTextKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run(view: EditorView) {
      const ghost = view.state.field(ghostTextValueField, false);
      if (!ghost) return false;

      const pos = view.state.selection.main.head;

      view.dispatch({
        changes: { from: view.state.selection.main.head, insert: ghost },
        selection: { anchor: pos + ghost.length },
        effects: [setGhostTextEffect.of(""), setShouldTriggerEffect.of(false)]
      });

      return true;
    }
  }
]);

export function ghostTextExtension() {
  return [
    ghostTextField,
    ghostTextValueField,
    acceptGhostTextKeymap,
    shouldTriggerCompletionField,
    clearGhostTextOnEscape
  ];
}
