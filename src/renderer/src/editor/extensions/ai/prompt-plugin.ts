import { Decoration, DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { Range } from "@codemirror/state";
import { PromptWidget } from "./prompt-widget";
import { getActiveNoteBlock } from "@/editor/block/utils";

export class PromptPlugin {
  decorations: DecorationSet = Decoration.none;
  highlightDecorations: DecorationSet = Decoration.none;
  isProcessing = false;
  selectedText = "";
  position = { from: 0, to: 0 };
  isPromptOpen = false;

  constructor(private view: EditorView) {}

  showPrompt(from: number, to: number, selectedText: string) {
    this.position = { from, to };

    this.selectedText = selectedText;
    this.isProcessing = false;
    this.isPromptOpen = true;
    this.updateDecorations();
    this.updateCursorVisibility();
  }

  hidePrompt() {
    this.decorations = Decoration.none;
    this.isProcessing = false;
    this.selectedText = "";
    this.isPromptOpen = false;
    this.updateCursorVisibility();
    this.view.dispatch({});
    this.view.focus();
  }

  allDecorations(): DecorationSet {
    // Properly combine decorations
    const decorations: Range<Decoration>[] = [];

    // Add prompt widget decorations
    this.decorations.between(0, this.view.state.doc.length, (from, to, decoration) => {
      decorations.push(decoration.range(from, to));
    });

    // Add highlight decorations
    this.highlightDecorations.between(0, this.view.state.doc.length, (from, to, decoration) => {
      decorations.push(decoration.range(from, to));
    });

    return Decoration.set(
      decorations.sort((a, b) => a.from - b.from),
      true
    );
  }

  setProcessing(processing: boolean) {
    this.isProcessing = processing;
    this.updateDecorations();
  }

  private updateCursorVisibility() {
    if (this.isPromptOpen) {
      this.view.dom.classList.add("ai-prompt-active");
    } else {
      this.view.dom.classList.remove("ai-prompt-active");
    }
  }
  private insertResponse(response: string) {
    const changes = this.view.state.changes({
      from: this.position.from,
      to: this.position.to,
      insert: response
    });

    this.view.dispatch({
      changes,
      selection: { anchor: this.position.from + response.length }
    });

    const highlightMark = Decoration.mark({
      class: "ai-response-highlight"
    });

    this.highlightDecorations = Decoration.set([
      highlightMark.range(this.position.from, this.position.to + response.length)
    ]);

    this.view.dispatch({});

    setTimeout(() => {
      this.highlightDecorations = Decoration.none;
      this.view.dispatch({});
    }, 500);
  }

  private updateDecorations() {
    const widget = new PromptWidget({
      onSubmit: async (prompt) => {
        const block = getActiveNoteBlock(this.view.state);

        const blockContentBefore = this.view.state.sliceDoc(block.content.from, this.position.from);
        const blockContentAfter = this.view.state.sliceDoc(this.position.to, block.content.to);

        this.setProcessing(true);

        const response = await window.api.ai.prompt({
          selectedText: this.selectedText,
          prompt,
          content: {
            before: blockContentBefore,
            after: blockContentAfter
          }
        });

        this.insertResponse(response);

        this.hidePrompt();
      },
      onClose: () => {
        this.hidePrompt();
      },
      selectedText: this.selectedText,
      isLoading: this.isProcessing
    });

    this.decorations = Decoration.set([
      Decoration.widget({
        widget,
        side: 1,
        block: false
      }).range(this.position.to)
    ]);

    this.view.dispatch({});
  }

  update(update: ViewUpdate) {
    if (update.docChanged) {
      this.decorations = this.decorations.map(update.changes);
      this.highlightDecorations = this.highlightDecorations.map(update.changes);
    }
  }

  destroy() {
    // Cleanup cursor visibility
    const editor = this.view.dom;
    editor.classList.remove("ai-prompt-active");
  }
}
