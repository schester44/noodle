import { create } from "zustand";
import { EditorInstance } from "../editor/editor";
import { produce } from "immer";
import { useAppStore } from "./app-store";
import { useNoteStore } from "./note-store";
import { getCM } from "@replit/codemirror-vim";

type EditorState = {
  activeEditor: string;
  editors: Record<string, EditorInstance>;
};

type EditorStore = EditorState & {
  setActiveEditor: (
    path: string,
    opts?: { initialLineNumber?: number; initialWordsToHighlight?: string[] }
  ) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  activeEditor: "default.txt",
  editors: {},
  setActiveEditor: (path, opts) => {
    const appStore = useAppStore.getState();
    const noteStore = useNoteStore.getState();

    set(
      produce((draft: EditorState) => {
        if (!draft.editors[path]) {
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
            initialLineNumber: opts?.initialLineNumber,
            ...(opts?.initialWordsToHighlight
              ? {
                  onContentLoaded: () => {
                    opts.initialWordsToHighlight?.forEach((word) => {
                      const cm = getCM(editor.view);

                      if (!cm) {
                        console.error("Could not get CM instance for editor");
                        return;
                      }

                      const query = new RegExp(word, "g");

                      // FIXME: This works but it doesn't clear on escape.
                      cm.addOverlay({ query });
                    });
                  }
                }
              : {})
          });

          draft.editors[path] = editor;
        }

        if (path !== draft.activeEditor) {
          draft.editors[path].previousFilePath = draft.activeEditor;
        }

        draft.activeEditor = path;
      })
    );
  }
}));
