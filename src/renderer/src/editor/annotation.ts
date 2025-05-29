import { Annotation } from "@codemirror/state";

export const editorEvent = Annotation.define();

export const LANGUAGE_CHANGE = "language-change";
export const CURRENCIES_LOADED = "editor-currencies-loaded";
export const SET_CONTENT = "editor-set-content";
export const ADD_NEW_BLOCK = "editor-add-new-block";
export const MOVE_BLOCK = "editor-move-block";
export const DELETE_BLOCK = "editor-delete-block";
export const CURSOR_CHANGE = "editor-cursor-change";
export const APPEND_BLOCK = "editor-append-block";
export const SET_FONT = "editor-set-font";

export function transactionsHasAnnotation(transactions, annotation) {
  return transactions.some((tr) => tr.annotation(editorEvent) === annotation);
}
