import { create } from "zustand";
import { EditorInstance } from "../editor/editor";
import { produce } from "immer";

type EditorState = {
  activeEditor: string;
  editors: Record<string, EditorInstance>;
};

type EditorStore = EditorState & {
  setActiveEditor: (path: string) => void;
  addEditor(path: string, editor: EditorInstance): void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  activeEditor: "default.txt",
  editors: {},
  setActiveEditor: (path) => {
    set(
      produce((draft: EditorState) => {
        // if we don't delete the editor then the Editor won't render it because we destroy the CM view when activeEditor changes
        delete draft.editors[draft.activeEditor];
        draft.activeEditor = path;
      })
    );
  },
  addEditor: (path, editor) => {
    set(
      produce((draft) => {
        draft.activeEditor = path;
        draft.editors[path] = editor;
      })
    );
  }
}));
