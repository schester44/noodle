import { Compartment, EditorState, StateField } from "@codemirror/state";
import { Annotation } from "@codemirror/state";
import { getCM, vim } from "@replit/codemirror-vim";
import { EditorView } from "@codemirror/view";

export const vimCompartment = new Compartment();
export const vimModeAnnotation = Annotation.define<string>();

export function toggleVIMExtension(view: EditorView, enabled: boolean) {
  view.dispatch({
    effects: vimCompartment.reconfigure(enabled ? vimExtension() : [])
  });
}

export const vimModeField = StateField.define<string>({
  create() {
    return "normal";
  },
  update(value, tr) {
    const newMode = tr.annotation(vimModeAnnotation);
    return newMode ?? value;
  }
});

export function setupVimModeSync(view: EditorView) {
  const cm = getCM(view);
  if (!cm) return;

  cm.on("vim-mode-change", (e: { mode: string }) => {
    setTimeout(() => {
      view.dispatch({
        annotations: vimModeAnnotation.of(e.mode)
      });
    }, 0);
  });
}

export function vimExtension() {
  return [vimModeField, vim()];
}

export function isInInsertMode(state: EditorState) {
  const mode = state.field(vimModeField, false);

  if (!mode) return true;

  return mode === "insert";
}
