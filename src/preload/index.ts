import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { getFonts } from "font-list";
import { IPC_CHANNELS } from "@common/constants";

const api: typeof window.api = {
  closeWindow: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW);
  },
  searchNotes: (query: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.SEARCH_NOTES, query);
  },
  getAppVersion: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION);
  },
  checkForUpdates: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATES);
  },
  getAppConfig: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.GET_APP_CONFIG);
  },
  ai: {
    async getResponse(opts: { before: string; after: string; language: string }) {
      return ipcRenderer.invoke(IPC_CHANNELS.GET_AI_RESPONSE, opts);
    },
    async prompt(opts: {
      content: { before: string; after: string };
      selectedText: string;
      prompt: string;
    }) {
      return ipcRenderer.invoke(IPC_CHANNELS.AI_PROMPT, opts);
    }
  },
  getFonts: async () => {
    const fonts = await getFonts({ disableQuoting: true });

    return fonts;
  },
  settings: {
    async loadConfig() {
      return ipcRenderer.invoke(IPC_CHANNELS.LOAD_SETTINGS);
    },
    saveUserConfig(config) {
      return ipcRenderer.invoke(IPC_CHANNELS.SAVE_USER_SETTINGS, config);
    }
  },
  buffer: {
    async new() {
      return await ipcRenderer.invoke(IPC_CHANNELS.NEW_BUFFER);
    },
    async create(opts) {
      return await ipcRenderer.invoke(IPC_CHANNELS.CREATE_BUFFER, opts);
    },
    async load(file) {
      return await ipcRenderer.invoke(IPC_CHANNELS.LOAD_BUFFER, file);
    },
    async save(file, content) {
      return await ipcRenderer.invoke(IPC_CHANNELS.SAVE_BUFFER, { file, content });
    },
    async getAll() {
      return await ipcRenderer.invoke(IPC_CHANNELS.GET_ALL_BUFFERS);
    },
    async getFileTree() {
      return await ipcRenderer.invoke(IPC_CHANNELS.GET_FILE_TREE);
    }
  }
};

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
  window.api = api;
}
