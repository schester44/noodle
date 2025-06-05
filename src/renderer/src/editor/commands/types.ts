import { EditorView } from "@codemirror/view";
import { EditorInstance } from "../editor";

export type EditorCommand = (opts: {
  editor: EditorInstance | null;
  view: EditorView;
}) => Promise<boolean> | boolean;
