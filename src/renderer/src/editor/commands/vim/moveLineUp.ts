import { NOTE_BLOCK_DELIMITER } from "@common/constants";
import { EditorSelection, TransactionSpec } from "@codemirror/state";
import { EditorCommand } from "../types";

// One for metadata and one for the first block's delimiter.
const FIRST_LINE_IN_DOCUMENT = 3;

export const moveLineUp: EditorCommand = ({ view }) => {
  const pos = view.state.selection.main.head;

  const currentLine = view.state.doc.lineAt(pos);
  const prevLine = view.state.doc.line(currentLine.number - 1);

  if (currentLine.number === FIRST_LINE_IN_DOCUMENT) return false;

  const textA = prevLine.text;
  const textB = currentLine.text;

  const isDelimiter = textA.startsWith(NOTE_BLOCK_DELIMITER);

  const col = pos - currentLine.from;
  const newLineStart = currentLine.from - textA.length - 1;

  let insert = `${textB}\n${textA}`;
  let newSelectionPos = Math.min(newLineStart + col, newLineStart + textA.length);

  let from = prevLine.from;

  if (isDelimiter) {
    const delimiter = textA;

    const realPrevLine = view.state.doc.line(prevLine.number - 1);

    insert = `${textB}\n${delimiter}\n${realPrevLine.text}`;
    from = realPrevLine.from;

    const newLineStart = currentLine.from - realPrevLine.text.length - 2;

    newSelectionPos = Math.min(
      newLineStart + col - delimiter.length,
      newLineStart + textA.length - delimiter.length
    );
  }

  const changes = [
    {
      from,
      to: currentLine.to,
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
