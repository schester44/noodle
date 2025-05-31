import { EditorLessCommand } from "../types";
import { EditorSelection, TransactionSpec } from "@codemirror/state";

export const toggleCheckbox: EditorLessCommand = (view) => {
  const pos = view.state.selection.main.head;

  const currentLine = view.state.doc.lineAt(pos);

  const checkboxRegex = /^\s*[-*] \[([ x])\]/;

  const currentLineText = currentLine.text;

  const match = currentLineText.match(checkboxRegex);

  if (!match) return true;

  const changes = [
    {
      from: currentLine.from,
      to: currentLine.to,
      insert: currentLineText.replace(checkboxRegex, (match, checked) => {
        const isChecked = checked === " ";

        return isChecked ? match.replace("[ ]", "[x]") : match.replace("[x]", "[ ]");
      })
    }
  ];

  const tx: TransactionSpec = {
    changes,
    scrollIntoView: true,
    selection: EditorSelection.cursor(pos)
  };

  view.dispatch(tx);

  return true;
};
