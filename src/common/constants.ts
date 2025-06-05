export const IPC_CHANNELS = {
  GET_APP_CONFIG: "app:get-config",
  GET_AI_RESPONSE: "ai:get-response",
  LOAD_SETTINGS: "settings:load-config",
  SAVE_USER_SETTINGS: "settings:save-user-config",
  NEW_BUFFER: "buffer:new",
  LOAD_BUFFER: "buffer:load",
  SAVE_BUFFER: "buffer:save",
  CREATE_BUFFER: "buffer:create",
  GET_ALL_BUFFERS: "buffer:get-all",
  GET_APP_VERSION: "app:get-version",
  CHECK_FOR_UPDATES: "app:check-for-updates"
} as const;

export const NOTE_BLOCK_DELIMITER = "∞∞∞";

export const APPNAME = "noodle";
