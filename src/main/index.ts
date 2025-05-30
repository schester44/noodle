import { app, BrowserWindow } from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";

import { createWindow, getBackgroundColor } from "./window";
import { FileLibrary, setupFileLibraryEventListeners } from "./library";
import { store as userConfig } from "./store/user-config";
import { getLibraryPath } from "./utils/get-library-path";
import { setupSettingsEventListeners } from "./settings";
import { setupAIEventListeners } from "./extensions/ai";

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function init() {
  await app.whenReady();

  electronApp.setAppUserModelId("com.noodle");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);

    const isAlwaysOnTop = userConfig.get("window.alwaysOnTop") as boolean;

    window.setAlwaysOnTop(isAlwaysOnTop, "screen-saver");

    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  });

  let notesWindow = createWindow({
    backgroundColor: getBackgroundColor(userConfig.get("theme"))
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      notesWindow = createWindow({
        backgroundColor: getBackgroundColor(userConfig.get("theme"))
      });
    }
  });

  const libraryPath = getLibraryPath(userConfig.get("libraryPath"));

  const fileLibrary = new FileLibrary(libraryPath);

  let apiKey = userConfig.get("ai.apiKey", "");
  let aiModel = userConfig.get("ai.model", "");

  setupSettingsEventListeners({
    onDidAnyChange: (config) => {
      apiKey = config.ai.apiKey;
      aiModel = config.ai.model;

      notesWindow.setBackgroundColor(getBackgroundColor(config.theme));
      notesWindow.setAlwaysOnTop(config.window.alwaysOnTop, "screen-saver");
    }
  });

  setupFileLibraryEventListeners({ library: fileLibrary });

  setupAIEventListeners({
    settings: () => ({
      apiKey,
      aiModel
    })
  });
}

init();
