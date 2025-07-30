import { App, app, BrowserWindow, nativeImage } from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";

import log from "electron-log";
import { createWindow, getBackgroundColor } from "./window";
import { FileLibrary, setupFileLibraryEventListeners } from "./library";
import { store as userConfig } from "./store/user-config";
import { getLibraryPath } from "./utils/get-library-path";
import { setupSettingsEventListeners } from "./settings";
import { setupAIEventListeners } from "./extensions/ai";
import { checkForUpdates, getLatestVersionInfo } from "./releases";
import { ipcMain } from "electron/main";
import { IPC_CHANNELS } from "@common/constants";
import { autoUpdater } from "electron-updater";
import { searchNotes } from "./search";
import { getResourceFilePath } from "./utils/get-resource-file";

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function init() {
  await app.whenReady();

  if (userConfig.get("autoUpdate")) {
    autoUpdater.checkForUpdates();
  }

  app.setAsDefaultProtocolClient("noodle");

  // FIXME: This doesn't load the icon when in development mode.
  const iconPath = getResourceFilePath("icon.icns");

  const icon = nativeImage.createFromPath(iconPath);

  await app.dock?.show();

  if (!icon.isEmpty()) {
    app.dock?.setIcon(icon);
  } else {
    console.warn("Failed to load dock icon at", iconPath);
  }

  setDockVisible(app, userConfig.get("window.showInDock"));

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

      setDockVisible(app, config.window.showInDock);
      checkForUpdates({ enabled: config.autoUpdate });
    }
  });

  function setDockVisible(app: App, visible: boolean) {
    if (visible) {
      app.dock?.show();
    }
    {
      app.dock?.hide();
    }
  }

  setupFileLibraryEventListeners({ library: fileLibrary });

  setupAIEventListeners({
    settings: () => ({
      apiKey,
      aiModel
    })
  });

  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, async () => {
    const currentVersion = app.getVersion();
    const latestVersion = await getLatestVersionInfo();

    return { currentVersion, latestVersion };
  });

  ipcMain.handle(IPC_CHANNELS.SEARCH_NOTES, async (_, query) => {
    try {
      const results = await searchNotes({ path: libraryPath, query });

      return results;
    } catch (error) {
      log.error("Error searching notes:", error);

      return [];
    }
  });

  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATES, () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
    console.log("Closing window from main process");
    if (notesWindow) {
      notesWindow.close();
    }
  });

  checkForUpdates({ enabled: userConfig.get("autoUpdate") });
}

init();
