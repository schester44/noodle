import { create } from "zustand";
import { EditorInstance } from "../editor/editor";
import { produce } from "immer";
import { useAppStore } from "./app-store";
import { useNoteStore } from "./note-store";
import { scrollLineIntoView } from "@/editor/commands/scrollIntoView";

type EditorState = {
  activeEditor: string;
  editors: Record<string, EditorInstance>;
};

type EditorStore = EditorState & {
  setActiveEditor: (path: string, opts?: { initialLineNumber?: number }) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  activeEditor: "default.txt",
  editors: {},
  setActiveEditor: (path, opts) => {
    const appStore = useAppStore.getState();
    const noteStore = useNoteStore.getState();

    const editor = new EditorInstance({
      path,
      actions: { updateCurrentNote: noteStore.updateCurrentNote },
      isAIEnabled: appStore.userSettings.ai.enabled,
      isVIMEnabled: appStore.userSettings.vim,
      prevousFilePath: null,
      initialKeyBindings: appStore.userSettings.keyBindings,
      initialTheme: {
        theme: appStore.userSettings.theme,
        ...appStore.userSettings.font
      },
      initialLineNumber: opts?.initialLineNumber
    });

    set(
      produce((draft: EditorState) => {
        // if we don't delete the editor then the Editor won't render it because we destroy the CM view when activeEditor changes
        delete draft.editors[draft.activeEditor];
        editor.previousFilePath = draft.activeEditor;
        draft.editors[path] = editor;
        draft.activeEditor = path;
      })
    );
  }
}));
