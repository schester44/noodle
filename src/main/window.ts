import { shell, BrowserWindow } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { store as appConfig } from "./store/app-config";

const FOCUSABLE_IN_DEV = false;

export function createWindow(): BrowserWindow {
  const windowConfig = appConfig.get("window");

  const mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    x: windowConfig.x,
    y: windowConfig.y,
    show: false,
    frame: false,
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
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
