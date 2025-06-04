import { redoDepth } from "@codemirror/commands";
import { BlockState } from "../../block/block-parsing";
import { blockState } from "../../block/state/block-state";
import { EditorInstance } from "../../editor";
import { ViewPlugin } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { getActiveNoteBlock } from "../../block/utils";
import { changeLanguageTo } from "../../commands/changeLanguage";
import levenshtein from "js-levenshtein";

const detectionWorker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

detectionWorker.onmessage = (event) => {
  console.log("🪵 event", event);
  // TODO: handle the message from the worker
  // implement the changeLanguageTo function
};

const editorInstances = {};

export function languageDetection({ path, editor }: { path: string; editor: EditorInstance }) {
  const previousBlockContent = {};
  let idleCallbackId: number | null = null;
  editorInstances[path] = editor;

  const plugin = ViewPlugin.fromClass(
    class {
      update(update: { docChanged: boolean; state: EditorState }) {
        if (update.docChanged) {
          if (idleCallbackId !== null) {
            cancelIdleCallback(idleCallbackId);
            idleCallbackId = null;
          }

          idleCallbackId = requestIdleCallback(() => {
            idleCallbackId = null;

            const range = update.state.selection.asSingle().ranges[0];
            const blocks = update.state.field(blockState);

            let foundBlock: BlockState | null = null;
            let idx = -1;

            for (let i = 0; i < blocks.length; i++) {
              const block = blocks[i];

              if (block && block.content.from <= range.from && block.content.to >= range.from) {
                foundBlock = block;
                idx = i;
                break;
              }
            }

            if (!foundBlock) return;

            if (foundBlock.language.auto === false) {
              // if language is not auto, set it's previousBlockContent to null so that we'll trigger a language detection
              // immediately if the user changes the language to auto
              delete previousBlockContent[idx];
              return;
            }

            const content = update.state.doc.sliceString(
              foundBlock.content.from,
              foundBlock.content.to
            );

            if (content === "" && redoDepth(update.state) === 0) {
              // if content is cleared, set language to default

              const view = editor.view;
              const block = getActiveNoteBlock(view.state);

              if (block.language.name !== editor.defaultBlockToken) {
                changeLanguageTo(view.state, view.dispatch, block, editor.defaultBlockToken, true);
              }

              delete previousBlockContent[idx];
            }

            if (content.length <= 8) return;

            const threshold = content.length * 0.1;

            if (
              !previousBlockContent[idx] ||
              levenshtein(previousBlockContent[idx], content) >= threshold
            ) {
              console.log(
                "Scheduling language detection for block",
                idx,
                "with threshold",
                threshold
              );

              detectionWorker.postMessage({
                content: content,
                idx: idx,
                path: path
              });

              previousBlockContent[idx] = content;
            }
          });
        }
      }

      destroy() {
        console.log("Removing editorInstance for:", path);
        delete editorInstances[path];
      }
    }
  );

  return plugin;
}
