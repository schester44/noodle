import { useCallback, useEffect, useState } from "react";
import { Editor } from "./components/editor/Editor";
import { useAppStore } from "./stores/app-store";
import { TitleBar } from "./components/title-bar";
import { ThemeProvider } from "./components/theme-provider";
import { useEditorStore } from "./stores/editor-store";
import { tinykeys } from "tinykeys";
import { useNoteStore } from "./stores/note-store";
import { cmToTinyKeys } from "./lib/utils";

function App(): React.JSX.Element {
  const [loaded, setLoaded] = useState(false);

  const loadUserSettings = useAppStore((state) => state.saveUserSettings);
  const setActiveEditor = useEditorStore((state) => state.setActiveEditor);
  const currentEditor = useEditorStore((state) => state.activeEditor);
  const currentBufferName = useNoteStore((state) => state.currentBufferName);
  const toggleSettingsDialog = useAppStore((state) => state.toggleSettingsDialog);

  useEffect(() => {
    window.api.settings.loadConfig().then((config) => {
      loadUserSettings(config.userConfig);
      setActiveEditor(config.appConfig.lastOpenedFile);
      setLoaded(true);
    });
  }, [loadUserSettings, setActiveEditor]);

  const handleNewNote = useCallback(async () => {
    const buf = await window.api.buffer.new();

    setActiveEditor(buf.path);
  }, [setActiveEditor]);

  const newNoteKeyBind = useAppStore((state) => state.userSettings.keyBindings.newNote);

  useEffect(() => {
    const keyBind = cmToTinyKeys(newNoteKeyBind || "Meta+n");

    const unsub = tinykeys(window, {
      "Meta+,": () => {
        toggleSettingsDialog();
      },
      [keyBind]: () => {
        handleNewNote();
      }
    });

    return () => {
      unsub();
    };
  }, [handleNewNote, toggleSettingsDialog, newNoteKeyBind]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader">Loader</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="h-full flex flex-col">
        <TitleBar
          bufferName={currentBufferName}
          activeEditor={currentEditor}
          onNewNote={handleNewNote}
          onNoteSelect={setActiveEditor}
        />
        <div className="flex-1 overflow-hidden">
          <Editor fileName={currentEditor} />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
