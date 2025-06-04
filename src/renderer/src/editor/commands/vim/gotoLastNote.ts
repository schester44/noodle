import { useEditorStore } from "@/stores/editor-store";
import { EditorLessCommand } from "../types";

export const gotoLastNote: EditorLessCommand = (_, editor) => {
  if (!editor.previousFilePath) return true;

  const store = useEditorStore.getState();

  store.setActiveEditor(editor.previousFilePath);

  return true;
};
