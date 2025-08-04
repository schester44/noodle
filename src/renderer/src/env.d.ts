/// <reference types="vite/client" />
import { ElectronAPI } from "@electron-toolkit/preload";
import { ParsedSearchResult } from "src/main/search";
import { UserConfig } from "src/main/store/user-config";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      closeWindow: () => void;
      getAppVersion: () => Promise<{ latestVersion: string; currentVersion: string }>;
      getAppConfig: () => Promise<{ lastOpenedFile: string }>;
      searchNotes: (query: string) => Promise<ParsedSearchResult[]>;
      checkForUpdates: () => Promise<void>;
      ai: {
        testConnection: () => Promise<{ status: "success" | "error"; message?: string }>;
        getResponse: (args: { before: string; after: string; language: string }) => Promise<string>;
        prompt: (args: {
          content: { before: string; after: string };
          selectedText: string;
          prompt: string;
        }) => Promise<string>;
      };
      getFonts: () => Promise<string[]>;
      settings: {
        loadConfig: () => Promise<{
          userConfig: UserConfig;
          appConfig: { lastOpenedFile: string };
        }>;
        saveUserConfig: (config: UserConfig) => Promise<void>;
      };
      buffer: {
        new: () => Promise<{ path: string }>;
        create: (opts: {
          file: string;
          template?: "initial" | "daily";
        }) => Promise<{ path: string }>;
        load: (file: string) => Promise<string>;
        save: (file: string, content: string) => Promise<void>;
        getAll: () => Promise<
          Array<{ fullpath: string; path: string; file: string; name: string; tags: string[] }>
        >;
        getFileTree: () => Promise<FileTreeItem>;
      };
    };
  }
}

type FileTreeItem = {
  name: string;
  type: "directory" | "file";
  children?: FileTreeItem[];
  path: string;
};
