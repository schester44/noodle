import { NoteFormat } from "@common/NoteFormat";
import { ensureSyntaxTree, foldEffect, foldGutter, foldKeymap } from "@codemirror/language";
import { Compartment, EditorSelection, EditorState, Transaction } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap
} from "@codemirror/view";
import { themeExtension } from "./theme";
import { langExtension } from "./lang/lang";
import { blockExtension } from "./block/block";
import { keymapExtension, registerVimKeymaps } from "./extensions/keymaps";
import { defaultKeymap, history } from "@codemirror/commands";
import { highlightSelectionMatches } from "@codemirror/search";
import { editorEvent, SET_CONTENT } from "./annotation";
import { autoSaveContent } from "./extensions/autosave";
import { emitCursorChange } from "./extensions/emit-cursor-change";
import { NoteStoreActions } from "../stores/note-store";
import { changeCurrentBlockLanguage } from "./commands/changeLanguage";
import { languageDetection } from "./lang/detection/extension";
import {
  aiAutoCompletionExtension,
  aiAutoCompletionCompartment
} from "./extensions/ai/auto-completion-extension";
import { setupVimModeSync, vimCompartment, vimExtension, vimModeField } from "./extensions/vim";
import { linksExtension } from "./extensions/links";
import { markdown } from "@codemirror/lang-markdown";
import { markdownExtensions } from "./extensions/markdown";
import { getActiveNoteBlock, getBlockLineFromPos, getSelectionSize } from "./block/utils";
import { aiPromptCompartment, aiPromptExtension } from "./extensions/ai/prompt-extension";
import { AppState } from "@/stores/app-store";

export class EditorInstance {
  note: NoteFormat | null = null;
  diskContent: string = "";
  private path: string;
  private contentLoaded: boolean = false;
  name: string = "";
  view: EditorView;
  defaultBlockToken: string = "markdown";
  defaultBlockAutoDetect: boolean = true;
  keymapCompartment: Compartment;
  previousFilePath: string | null = null;
  initialLineNumber: number | undefined;
  onContentLoaded: () => void;

  constructor({
    path,
    actions,
    initialTheme,
    ai,
    isVIMEnabled = false,
    initialKeyBindings = {},
    prevousFilePath,
    initialLineNumber,
    onContentLoaded
  }: {
    path: string;
    actions: Pick<NoteStoreActions, "updateCurrentNote">;
    ai: AppState["userSettings"]["ai"];
    initialTheme: { theme: string; fontSize: number; fontFamily: string; fontWeight: string };
    isVIMEnabled?: boolean;
    initialKeyBindings?: Record<string, string>;
    prevousFilePath: string | null;
    initialLineNumber?: number;
    onContentLoaded?: () => void;
  }) {
    this.path = path;
    this.keymapCompartment = new Compartment();
    this.previousFilePath = prevousFilePath;
    this.initialLineNumber = initialLineNumber;
    this.onContentLoaded = onContentLoaded || (() => {});

    registerVimKeymaps(this, initialKeyBindings);

    const state = EditorState.create({
      doc: "",
      extensions: [
        vimCompartment.of(isVIMEnabled ? vimExtension() : []),
        this.keymapCompartment.of(
          keymapExtension({ editor: this, userKeyBinds: initialKeyBindings })
        ),
        keymap.of(defaultKeymap),
        keymap.of(foldKeymap),
        EditorView.lineWrapping,
        themeExtension(initialTheme),
        langExtension(),
        blockExtension(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        highlightActiveLineGutter(),
        history(),
        autoSaveContent(this, 300),
        emitCursorChange({ editor: this, updateCurrentNote: actions.updateCurrentNote }),
        languageDetection({ path, editor: this }),
        aiAutoCompletionCompartment.of([
          ai.enabled && ai.features.autoCompleteEnabled ? aiAutoCompletionExtension() : []
        ]),
        aiPromptCompartment.of([
          ai.enabled && ai.features.promptEnabled ? aiPromptExtension() : []
        ]),
        aiPromptExtension(),
        linksExtension(),
        markdown(),
        markdownExtensions(),
        keymap.of([
          {
            key: "Escape",
            preventDefault: false,
            run(view: EditorView) {
              const mode = view.state.field(vimModeField, false);

              if (mode === "normal") {
                window.api.closeWindow();
              }
              return true;
            }
          }
        ]),
        EditorView.domEventHandlers({
          focus: (_event, view) => {
            // This is needed to ensure the bufferName is updated when switching to an existing editor
            const state = view.state;
            if (!state.selection.main.head) return;

            const cursorLine = getBlockLineFromPos(state, state.selection.main.head);
            const selectionSize = state.selection.ranges
              .map((sel) => getSelectionSize(state, sel))
              .reduce((a, b) => a + b, 0);
            const block = getActiveNoteBlock(state);

            if (block && cursorLine) {
              actions.updateCurrentNote({
                cursorLine,
                selectionSize,
                language: block.language.name,
                languageAuto: block.language.auto,
                bufferName: this.name
              });
            }
          }
        })
      ]
    });

    this.view = new EditorView({
      state: state
    });

    setupVimModeSync(this.view);

    this.loadContent();

    this.view.focus();

    window.addEventListener("beforeunload", () => {
      this.save();
    });
  }

  async loadContent() {
    const content = await window.api.buffer.load(this.path);
    this.diskContent = content;
    this.contentLoaded = true;

    this.setContent(content);
  }

  async save() {
    if (!this.contentLoaded) return;

    const content = this.getContent();

    if (content === this.diskContent) return;
    this.diskContent = content;

    await window.api.buffer.save(this.path, content);
  }

  getContent() {
    if (!this.note) {
      throw new Error("Note is not loaded");
    }

    this.note.content = this.view.state.sliceDoc();
    this.note.cursors = this.view.state.selection.toJSON();

    const ranges = this.note.cursors?.ranges;

    if (ranges?.from === 0 && ranges?.to === 0) {
      console.log("DEBUG!! Cursor is at 0,0");
    }

    return this.note.serialize();
  }

  updateNoteName(name: string) {
    if (!this.note) return;

    this.note.metadata.name = name;
    this.name = name;
  }

  storeFoldedRanges(folded: Array<{ from: number; to: number }>) {
    if (!this.note) return;

    this.note.metadata.folds = folded;
  }

  setContent(content: string) {
    try {
      this.note = NoteFormat.load(content);
    } catch {
      throw new Error("Error loading note");
    }

    this.name = this.note.metadata.name || this.path;

    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: this.note.content
      },
      annotations: [editorEvent.of(SET_CONTENT), Transaction.addToHistory.of(false)]
    });

    if (this.note.metadata.folds) {
      this.note.metadata.folds.forEach((fold) => {
        if (fold.from < fold.to) {
          this.view.dispatch({
            effects: foldEffect.of(fold)
          });
        }
      });
    }

    ensureSyntaxTree(this.view.state, this.view.state.doc.length, 5000);

    requestAnimationFrame(() => {
      if (this.initialLineNumber) {
        const line = this.view.state.doc.line(this.initialLineNumber);

        this.view.dispatch({
          effects: EditorView.scrollIntoView(line.from, { y: "start" })
        });
      } else {
        if (this.note?.cursors) {
          this.view.dispatch({
            selection: EditorSelection.fromJSON(this.note.cursors),
            scrollIntoView: true
          });
        } else {
          // if metadata doesn't contain cursor position, we set the cursor to the end of the buffer
          this.view.dispatch({
            selection: { anchor: this.view.state.doc.length, head: this.view.state.doc.length },
            scrollIntoView: true
          });
        }
      }

      this.onContentLoaded();
    });
  }

  setKeymaps(keyBindings: Record<string, string>) {
    this.view.dispatch({
      effects: this.keymapCompartment.reconfigure(
        keymapExtension({ editor: this, userKeyBinds: keyBindings })
      )
    });
  }

  setLanguage(lang: string | null, auto: boolean = false) {
    changeCurrentBlockLanguage(this.view.state, this.view.dispatch, lang, auto);
  }

  focus() {
    this.view.focus();
  }
}
