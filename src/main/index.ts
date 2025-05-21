import { app, BrowserWindow, ipcMain } from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";

import { createWindow } from "./window";
import { FileLibrary, setupFileLibraryEventListeners } from "./library";
import { store as userConfig } from "./store/user-config";
import { getLibraryPath } from "./utils/get-library-path";
import { nativeTheme } from "electron/main";
import { store } from "./store/app-config";

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function init() {
  await app.whenReady();

  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);

    const isAlwaysOnTop = userConfig.get("window.alwaysOnTop") as boolean;

    window.setAlwaysOnTop(isAlwaysOnTop, "screen-saver");

    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  });

  const notesWindow = createWindow();

  function setWindowTheme(theme: string, window: BrowserWindow) {
    const darkBackgroundColor = "#1A1A22";
    const lightBackgroundColor = "#FFFFFF";

    const backgroundColor =
      theme === "system"
        ? nativeTheme.shouldUseDarkColors
          ? darkBackgroundColor
          : lightBackgroundColor
        : theme === "dark"
          ? darkBackgroundColor
          : lightBackgroundColor;

    window.setBackgroundColor(backgroundColor);
  }

  setWindowTheme(userConfig.get("theme"), notesWindow);

  const libraryPath = getLibraryPath(userConfig.get("libraryPath"));

  const fileLibrary = new FileLibrary(libraryPath);

  let apiKey = userConfig.get("ai.apiKey");
  let aiModel = userConfig.get("ai.model");

  ipcMain.handle("app:getConfig", async () => {
    return {
      lastOpenedFile: store.get("lastOpenedFile")
    };
  });

  userConfig.onDidAnyChange((config) => {
    console.log("Config Change:", {
      ...config,
      ai: {
        ...config?.ai,
        apiKey: config?.ai.apiKey ? "********" : ""
      }
    });

    if (config?.theme) {
      setWindowTheme(config.theme, notesWindow);
    }

    if (config) {
      apiKey = config.ai.apiKey;
      aiModel = config.ai.model;

      notesWindow.setAlwaysOnTop(config.window.alwaysOnTop, "screen-saver");
    }
  });

  ipcMain.handle("settings:loadConfig", async () => {
    return {
      userConfig: userConfig.store,
      appConfig: {
        lastOpenedFile: store.get("lastOpenedFile")
      }
    };
  });

  ipcMain.handle("settings:saveUserConfig", async (_, config: { openAIAPIKey: string }) => {
    Object.keys(config).forEach((key) => {
      const value = config[key];

      userConfig.set(key, value);
    });
  });

  ipcMain.handle("ai:getResponse", async (_, { before, after, language }) => {
    const messages = [
      {
        role: "system",
        content: `You are an expert note-taking assistant. You complete partial thoughts naturally in a short, concise way. Write only 1–2 lines. Do not summarize or repeat existing content. The user is writing notes in ${language} format.`
      },
      {
        role: "user",
        content: `Here is the note so far:\n\n${before}<CURSOR>${after}\n\nPlease continue writing from the <CURSOR> position.`
      }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        max_tokens: 60,
        temperature: 0.7,
        stop: ["\n\n"]
      })
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("OpenAI API error:", error);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  });

  setupFileLibraryEventListeners({ library: fileLibrary });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

init();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
