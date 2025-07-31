import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { getNoteBlockFromPos } from "../../block/utils";
import { Compartment } from "@codemirror/state";
import {
  ghostTextExtension,
  setGhostTextEffect,
  setShouldTriggerEffect,
  shouldTriggerCompletionField
} from "../ghost-text";
import { logger } from "../../../lib/logger";
import { isInInsertMode } from "../vim";

let abortController: AbortController | null = null;
let debounceTimer: number | null = null;

export const aiAutoCompletionCompartment = new Compartment();

export function toggleAutoCompletionExtension(view: EditorView, enabled: boolean) {
  view.dispatch({
    effects: aiAutoCompletionCompartment.reconfigure(enabled ? aiAutoCompletionExtension() : [])
  });
}

export async function getAICompletion({
  before,
  after,
  language
}: {
  before: string;
  after: string;
  language: string;
}): Promise<string | null> {
  const response = await window.api.ai.getResponse({ before, after, language });

  return response;
}

// FIXME This is buggy
const enableCompletionOnRealTyping = EditorView.domEventHandlers({
  keydown(event, view) {
    if (
      event.key === "Tab" ||
      event.key.startsWith("Arrow") ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    // It’s likely a real character input, re-enable completions
    requestAnimationFrame(() => {
      view.dispatch({ effects: setShouldTriggerEffect.of(true) });
    });
  }
});

/**
 * Dont send anything to the server when the block is empty
 * */

export const aiCompletionExtension = ViewPlugin.fromClass(
  class {
    constructor(readonly view: EditorView) {}

    update(update: ViewUpdate) {
      if (!update.docChanged && !update.selectionSet) return;

      // Cancel any pending debounce or in-flight requests
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      if (abortController) abortController.abort();

      debounceTimer = window.setTimeout(() => {
        const shouldTrigger = this.view.state.field(shouldTriggerCompletionField);

        if (!isInInsertMode(this.view.state)) return;

        if (!shouldTrigger) return;

        const { state } = this.view;
        const pos = state.selection.main.head;
        const doc = state.doc.toString();
        const block = getNoteBlockFromPos(state, pos);

        const MAX_BEFORE = 1000;
        const MAX_AFTER = 200;

        const from = block.content.from > pos - MAX_BEFORE ? block.content.from : pos - MAX_BEFORE;

        const to = block.content.to < pos + MAX_AFTER ? block.content.to : pos + MAX_AFTER;

        const contextBefore = doc.slice(from, pos);
        const contextAfter = doc.slice(pos, to);

        abortController = new AbortController();

        logger.log("[AI] sending request", block.language.name);

        getAICompletion({
          before: contextBefore,
          after: contextAfter,
          language: block.language.name
        })
          .then((res) => {
            if (!res) return;

            this.view.dispatch({
              effects: setGhostTextEffect.of(res)
            });
          })
          .catch(logger.error);
      }, 300);
    }

    destroy() {
      logger.log("[AI] destroying completion extension");
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      if (abortController) abortController.abort();
    }
  }
);

export function aiAutoCompletionExtension() {
  return [aiCompletionExtension, enableCompletionOnRealTyping, ghostTextExtension()];
}
