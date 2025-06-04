import ElectronStore from "electron-store";

interface AppConfig {
  lastOpenedFile: string;
  window: {
    width: number;
    height: number;
    x: number | undefined;
    y: number | undefined;
  };
}

const schema: ElectronStore.Schema<AppConfig> = {
  lastOpenedFile: {
    type: "string",
    default: "default.txt"
  },
  window: {
    type: "object",
    default: {
      width: 900,
      height: 670,
      x: undefined,
      y: undefined
    },
    properties: {
      width: {
        type: "number",
        default: 900
      },
      height: {
        type: "number",
        default: 670
      },
      x: {
        type: "number",
        default: undefined
      },
      y: {
        type: "number",
        default: undefined
      }
    }
  }
};

export const store = new ElectronStore({ schema, name: "app-config" });
