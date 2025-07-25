import { useEffect, useLayoutEffect, useState } from "react";
import { useEditorStore } from "../../stores/editor-store";
import { StatusBar } from "./StatusBar";
import { useNoteStore } from "../../stores/note-store";
import { useAppStore } from "../../stores/app-store";
import { toggleCopilotExtension } from "../../editor/extensions/ai";
import { updateEditorFont, updateEditorTheme } from "@/editor/theme";
import { toggleVIMExtension } from "@/editor/extensions/vim";

function useEditor() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const editor = useEditorStore((state) => state.editors[state.activeEditor]);

  const isAIEnabled = useAppStore((state) => state.userSettings.ai.enabled);
  const isVIMEnabled = useAppStore((state) => state.userSettings.vim);
  const font = useAppStore((state) => state.userSettings.font);
  const theme = useAppStore((state) => state.userSettings.theme);
  const userKeyBinds = useAppStore((state) => state.userSettings.keyBindings);

  useEffect(() => {
    if (!editor) return;

    updateEditorTheme(editor.view, theme);
    updateEditorFont(editor.view, font);
  }, [editor, font, theme]);

  // FIXME, this is fairly hacky.
  useEffect(() => {
    if (!editor) return;

    toggleCopilotExtension(editor.view, isAIEnabled);
    toggleVIMExtension(editor.view, isVIMEnabled);
  }, [isAIEnabled, isVIMEnabled, editor]);

  useLayoutEffect(() => {
    if (!container) return;
    // FIXME I don't think we should be destroying the Editor view just because the global state changed a little.
    // This will likely come back to bite us once we get more complex with the editor.
    // you can attach/detach the editor.view.dom to/from the container.. some issues wih selection state depending on note size
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (!editor) return;

    container.appendChild(editor.view.dom);
    editor.view.focus();

    return () => {
      if (editor?.view.dom) {
        container?.removeChild(editor?.view.dom);
      }
    };
  }, [editor, container, isAIEnabled, theme, font, isVIMEnabled, userKeyBinds]);

  return { setContainer, editor };
}

export function Editor() {
  const { setContainer, editor } = useEditor();

  const language = useNoteStore((state) => state.currentLanguage);
  const isAutoDetect = useNoteStore((state) => state.currentLanguageAuto);

  function setLanguage(language: string) {
    if (language === "auto") {
      editor.setLanguage(null, true);
    } else {
      editor.setLanguage(language, false);
    }

    // FIXME: this is a hack to ensure the editor is focused after changing the language.
    // the editor was losing focus even after the language change.
    setTimeout(() => {
      editor.focus();
    }, 500);
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex-1 overflow-auto">
        <div id="editor-container" ref={setContainer} className="h-full" tabIndex={0} />
      </div>

      <StatusBar language={language} onLangChange={setLanguage} isAutoDetect={isAutoDetect} />
    </div>
  );
}
