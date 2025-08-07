import { useEditorStore } from "@/stores/editor-store";
import { EditorCommand } from "../types";

// Getting the editor from the store because the editor param is outdated due to the keymap extension not reloading when the editor changes.
export const gotoLastNote: EditorCommand = () => {
  const store = useEditorStore.getState();

  const editor = store.editors[store.activeEditor];
  if (!editor?.previousFilePath) return true;

  store.setActiveEditor(editor.previousFilePath);

  return true;
};
