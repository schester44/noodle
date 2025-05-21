import { create } from "zustand";
import { produce } from "immer";

type NoteState = {
  currentCursorLine: { line: number; col: number; length: number };
  currentSelectionSize: number;
  currentLanguage: string;
  currentLanguageAuto: boolean;
  currentBufferName: string;
};

export type NoteStoreActions = {
  updateCurrentNote: (update: {
    cursorLine: { line: number; col: number; length: number };
    selectionSize: number;
    language: string;
    languageAuto: boolean;
    bufferName: string;
  }) => void;
};

type NoteStore = NoteState & NoteStoreActions;

export const useNoteStore = create<NoteStore>((set) => ({
  currentBufferName: "",
  currentCursorLine: { line: 0, col: 0, length: 0 },
  currentSelectionSize: 0,
  currentLanguage: "",
  currentLanguageAuto: false,
  updateCurrentNote: (update) => {
    set(
      produce((state: NoteStore) => {
        state.currentCursorLine = update.cursorLine;
        state.currentSelectionSize = update.selectionSize;
        state.currentLanguage = update.language;
        state.currentLanguageAuto = update.languageAuto;
        state.currentBufferName = update.bufferName;
      })
    );
  }
}));
