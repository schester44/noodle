import { EditorView } from "@codemirror/view";
import { EditorInstance } from "../editor";

export type EditorCommand = (editor: EditorInstance | null) => (view: EditorView) => boolean;
export type EditorLessCommand = (view: EditorView, editor: EditorInstance) => boolean | void;
