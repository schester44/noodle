import { create } from "zustand";
import { EditorInstance } from "../editor/editor";
import { EditorView } from "@codemirror/view";
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
    opts?: { initialLineNumber?: number; initialWordsToHighlight?: string[]; query?: string }
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
                    if (opts?.query && opts?.initialLineNumber) {
                      moveSelectionToFirstMatch({
                        view: editor.view,
                        query: opts.query,
                        initialLineNumber: opts.initialLineNumber
                      });
                    }

                    opts.initialWordsToHighlight?.forEach((word) => {
                      const cm = getCM(editor.view);

                      if (!cm) {
                        console.error("Could not get CM instance for editor");
                        return;
                      }

                      const query = new RegExp(word, "g");

                      // FIXME: This works but it doesn't clear on escape because we're using a vim extension method and vim is expecting highlights to be added in a different way.
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

function moveSelectionToFirstMatch({
  view,
  query,
  initialLineNumber
}: {
  view: EditorView;
  query: string;
  initialLineNumber: number;
}) {
  const line = view.state.doc.line(initialLineNumber);

  const searchRegex = new RegExp(query, "g");
  const matchOnLine = line.text.match(searchRegex);

  if (matchOnLine?.[0]) {
    const indexOfMatch = line.text.indexOf(matchOnLine[0]);

    view.dispatch({
      selection: {
        anchor: line.from + indexOfMatch,
        head: line.from + indexOfMatch
      }
    });
  }
}
