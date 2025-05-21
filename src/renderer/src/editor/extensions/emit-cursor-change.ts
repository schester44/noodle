import { NoteStoreActions } from "../../stores/note-store";
import { CURSOR_CHANGE, editorEvent, LANGUAGE_CHANGE } from "../annotation";
import { getActiveNoteBlock, getBlockLineFromPos, getSelectionSize } from "../block/utils";
import { EditorInstance } from "../editor";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

export function emitCursorChange({
  editor,
  updateCurrentNote
}: {
  editor: EditorInstance;
  updateCurrentNote: NoteStoreActions["updateCurrentNote"];
}) {
  return ViewPlugin.fromClass(
    class {
      update(update: ViewUpdate) {
        // if the selection changed or the language changed (can happen without selection change),
        // emit a selection change
        const shouldUpdate = update.transactions.some((tr) => {
          const annotation = tr.annotation(editorEvent);

          return annotation === LANGUAGE_CHANGE || annotation === CURSOR_CHANGE;
        });

        if (update.selectionSet || shouldUpdate) {
          const cursorLine = getBlockLineFromPos(update.state, update.state.selection.main.head);

          const selectionSize = update.state.selection.ranges
            .map((sel) => getSelectionSize(update.state, sel))
            .reduce((a, b) => a + b, 0);

          const block = getActiveNoteBlock(update.state);

          if (block && cursorLine) {
            // we're storing this info in the note using Electron's IPC
            // so that we can use it when this note is opened in the editor
            // this fires anytime the cursor moves.
            updateCurrentNote({
              cursorLine,
              selectionSize,
              language: block.language.name,
              languageAuto: block.language.auto,
              bufferName: editor.name
            });
          }
        }
      }
    }
  );
}
