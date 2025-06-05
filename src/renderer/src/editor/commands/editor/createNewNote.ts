import { useEditorStore } from "@/stores/editor-store";
import { EditorCommand } from "../types";

export const createNewNote: EditorCommand = async ({ editor }) => {
  if (!editor) return false;

  const store = useEditorStore.getState();

  const { path } = await window.api.buffer.new();

  store.setActiveEditor(path);

  return true;
};
