import { EditorLessCommand } from "../types";
import { EditorSelection, TransactionSpec } from "@codemirror/state";
import { NOTE_BLOCK_DELIMITER } from "@common/constants";

export const moveLineDown: EditorLessCommand = (view) => {
  const pos = view.state.selection.main.head;

  const currentLine = view.state.doc.lineAt(pos);

  if (currentLine.number === view.state.doc.lines) return false;

  const nextLine = view.state.doc.line(currentLine.number + 1);

  const textA = currentLine.text;
  const textB = nextLine.text;

  const isDelimiter = textB.startsWith(NOTE_BLOCK_DELIMITER);

  const col = pos - currentLine.from;
  const newLineStart = currentLine.from + textB.length + 1;
  let to = nextLine.to;
  let insert = `${textB}\n${textA}`;
  let newSelectionPos = Math.min(newLineStart + col, newLineStart + textA.length);

  if (isDelimiter) {
    const delimiter = textB;

    const realNextLine = view.state.doc.line(nextLine.number + 1);
    insert = `${realNextLine.text}\n${delimiter}\n${textA}`;
    to = realNextLine.to;

    const newLineStart = currentLine.from + realNextLine.text.length + 2;

    newSelectionPos = Math.min(
      newLineStart + col + delimiter.length,
      newLineStart + textA.length + delimiter.length
    );
  }

  const changes = [
    {
      from: currentLine.from,
      to,
      insert
    }
  ];

  const tx: TransactionSpec = {
    changes,
    selection: EditorSelection.cursor(newSelectionPos),
    scrollIntoView: true
  };

  view.dispatch(tx);
  return true;
};
