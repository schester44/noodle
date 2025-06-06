import { useEditorStore } from "@/stores/editor-store";
import { EditorCommand } from "../types";

export const gotoLastNote: EditorCommand = ({ editor }) => {
  if (!editor?.previousFilePath) return true;

  const store = useEditorStore.getState();

  store.setActiveEditor(editor.previousFilePath);

  return true;
};
