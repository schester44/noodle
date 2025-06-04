import { IPC_CHANNELS } from "@common/constants";
import { ipcMain } from "electron";
import { store as appConfig } from "./store/app-config";
import { type UserConfig, store as userConfig } from "./store/user-config";

export function setupSettingsEventListeners({
  onDidAnyChange
}: {
  onDidAnyChange: (config: UserConfig) => void;
}): void {
  ipcMain.handle(IPC_CHANNELS.LOAD_SETTINGS, async () => {
    return {
      userConfig: userConfig.store,
      appConfig: {
        lastOpenedFile: appConfig.get("lastOpenedFile")
      }
    };
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_USER_SETTINGS, async (_, config: UserConfig) => {
    Object.keys(config).forEach((key) => {
      const value = config[key];

      userConfig.set(key, value);
    });
  });

  ipcMain.handle(IPC_CHANNELS.GET_APP_CONFIG, async () => {
    return {
      lastOpenedFile: appConfig.get("lastOpenedFile")
    };
  });

  userConfig.onDidAnyChange((config) => {
    if (!config) return;

    console.log("Config Change:", {
      ...config,
      ai: {
        ...config.ai,
        apiKey: config.ai.apiKey ? "********" : ""
      }
    });

    onDidAnyChange(config);
  });
}
