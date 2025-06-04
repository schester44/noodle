import { NoteFormat } from "@common/NoteFormat";
import { ensureSyntaxTree, foldGutter, foldKeymap } from "@codemirror/language";
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
import { aiExtension, copilotCompartment } from "./extensions/ai";
import { setupVimModeSync, vimCompartment, vimExtension } from "./extensions/vim";
import { linksExtension } from "./extensions/links";
import { markdown } from "@codemirror/lang-markdown";
import { markdownExtensions } from "./extensions/markdown";

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

  constructor({
    element,
    path,
    actions,
    isAIEnabled,
    initialTheme,
    isVIMEnabled = false,
    initialKeyBindings = {},
    prevousFilePath
  }: {
    element: Element;
    path: string;
    actions: NoteStoreActions;
    isAIEnabled: boolean;
    initialTheme: { theme: string; fontSize: number; fontFamily: string; fontWeight: string };
    isVIMEnabled?: boolean;
    initialKeyBindings?: Record<string, string>;
    prevousFilePath: string | null;
  }) {
    this.path = path;
    this.keymapCompartment = new Compartment();
    this.previousFilePath = prevousFilePath;

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
        copilotCompartment.of([isAIEnabled ? aiExtension() : []]),
        linksExtension(),
        markdown(),
        markdownExtensions()
      ]
    });

    this.view = new EditorView({
      state: state,
      parent: element
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

    ensureSyntaxTree(this.view.state, this.view.state.doc.length, 5000);

    requestAnimationFrame(() => {
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
