import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { getFonts } from "font-list";
// Custom APIs for renderer
const api = {
  getAppConfig: async () => {
    return ipcRenderer.invoke("app:getConfig");
  },
  ai: {
    async getResponse(opts: { before: string; after: string; language: string }) {
      return ipcRenderer.invoke("ai:getResponse", opts);
    }
  },
  getFonts: async () => {
    const fonts = await getFonts({ disableQuoting: true });

    return fonts;
  },
  settings: {
    async loadConfig() {
      return ipcRenderer.invoke("settings:loadConfig");
    },
    saveUserConfig(config: { openAIAPIKey: string }) {
      return ipcRenderer.invoke("settings:saveUserConfig", config);
    }
  },
  buffer: {
    async new() {
      return await ipcRenderer.invoke("buffer:new");
    },
    async load(file: string) {
      return await ipcRenderer.invoke("buffer:load", file);
    },
    async save(file: string, content: string) {
      return await ipcRenderer.invoke("buffer:save", { file, content });
    },
    async getAll() {
      return await ipcRenderer.invoke("buffer:getAll");
    }
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
