/// <reference types="vite/client" />
import { ElectronAPI } from "@electron-toolkit/preload";
import { UserConfig } from "src/main/store/user-config";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getAppVersion: () => Promise<{ latestVersion: string; currentVersion: string }>;
      getAppConfig: () => Promise<{ lastOpenedFile: string }>;
      checkForUpdates: () => Promise<void>;
      ai: {
        getResponse: (args: { before: string; after: string; language: string }) => Promise<string>;
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
        getAll: () => Promise<Array<{ path: string; file: string }>>;
      };
    };
  }
}
