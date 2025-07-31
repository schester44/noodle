import { StateEffect } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";
import { PromptPlugin } from "./prompt-plugin";

export const showPromptEffect = StateEffect.define<{
  from: number;
  to: number;
  selectedText: string;
}>();
export const hidePromptEffect = StateEffect.define();

export const promptPlugin = ViewPlugin.fromClass(PromptPlugin, {
  decorations: (plugin) => plugin.allDecorations()
});

export function inlinePrompting() {
  return [promptPlugin];
}
