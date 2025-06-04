export const IPC_CHANNELS = {
  GET_APP_CONFIG: "app:get-config",
  GET_AI_RESPONSE: "ai:get-response",
  LOAD_SETTINGS: "settings:load-config",
  SAVE_USER_SETTINGS: "settings:save-user-config",
  NEW_BUFFER: "buffer:new",
  LOAD_BUFFER: "buffer:load",
  SAVE_BUFFER: "buffer:save",
  GET_ALL_BUFFERS: "buffer:get-all"
} as const;

export const NOTE_BLOCK_DELIMITER = "∞∞∞";

export const APPNAME = "noodle";
