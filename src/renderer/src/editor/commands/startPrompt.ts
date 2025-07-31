import { useAppStore } from "@/stores/app-store";
import { promptPlugin, showPromptEffect } from "../extensions/ai/prompt-extension";
import { EditorCommand } from "./types";

export const startPrompt: EditorCommand = async ({ editor }) => {
  if (!editor) return false;

  const isEnabled = useAppStore.getState().userSettings.ai.features.promptEnabled;

  if (!isEnabled) return false;

  const selection = editor.view.state.selection.main;
  const selectedText = selection.empty
    ? ""
    : editor.view.state.doc.sliceString(selection.from, selection.to);

  // TODO: If you're on a line that has text then put the prompt on the next line.
  editor.view.dispatch({
    effects: showPromptEffect.of({ from: selection.from, to: selection.to, selectedText })
  });

  const plugin = editor.view.plugin(promptPlugin);

  if (plugin) {
    plugin.showPrompt(selection.from, selection.to, selectedText);
  }

  return true;
};
