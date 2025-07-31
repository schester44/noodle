import { Compartment, StateEffect } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { PromptPlugin } from "./prompt-plugin";

export const aiPromptCompartment = new Compartment();

export function toggleAIPromptExtension(view: EditorView, enabled: boolean) {
  view.dispatch({
    effects: aiPromptCompartment.reconfigure(enabled ? aiPromptExtension() : [])
  });
}

export const showPromptEffect = StateEffect.define<{
  from: number;
  to: number;
  selectedText: string;
}>();
export const hidePromptEffect = StateEffect.define();

export const promptPlugin = ViewPlugin.fromClass(PromptPlugin, {
  decorations: (plugin) => plugin.allDecorations()
});

export function aiPromptExtension() {
  return [promptPlugin];
}
