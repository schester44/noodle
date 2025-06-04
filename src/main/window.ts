import { shell, BrowserWindow, nativeTheme } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { store as appConfig } from "./store/app-config";

const FOCUSABLE_IN_DEV = false;

export function createWindow(args?: { backgroundColor?: string }): BrowserWindow {
  const windowConfig = appConfig.get("window");

  const mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    x: windowConfig.x,
    y: windowConfig.y,
    show: false,
    type: "panel",
    titleBarStyle: "hiddenInset",
    minimizable: false,
    maximizable: false,
    resizable: true,
    fullscreenable: false,
    fullscreen: false,
    minWidth: 200,
    minHeight: 200,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    backgroundColor: args?.backgroundColor
  });

  mainWindow.on("ready-to-show", () => {
    if (!is.dev || FOCUSABLE_IN_DEV) {
      mainWindow.show();
    } else {
      mainWindow.showInactive();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Store window size and position in config when changed
  mainWindow.on("resize", () => updateWindowConfig(mainWindow));
  mainWindow.on("move", () => updateWindowConfig(mainWindow));

  return mainWindow;
}

function updateWindowConfig(window: BrowserWindow) {
  const [x, y] = window.getPosition();
  const [width, height] = window.getSize();

  appConfig.set("window", {
    x,
    y,
    width,
    height
  });
}

export function getBackgroundColor(theme: string): string {
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

  return backgroundColor;
}
