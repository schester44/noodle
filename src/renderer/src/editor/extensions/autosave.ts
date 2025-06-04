import { ViewPlugin, ViewUpdate } from "@codemirror/view";

import debounce from "debounce";
import { EditorInstance } from "../editor";
import { SET_CONTENT } from "../annotation";

export const autoSaveContent = (editor: EditorInstance, interval = 300) => {
  const save = debounce(() => {
    editor.save();
  }, interval);

  return ViewPlugin.fromClass(
    class {
      update(update: ViewUpdate) {
        if (update.docChanged) {
          const initialSetContent = update.transactions
            .flatMap((t) => t.annotations)
            .some((a) => a.value === SET_CONTENT);
          if (!initialSetContent) {
            save();
          }
        }
      }
    }
  );
};
