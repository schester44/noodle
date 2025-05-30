import ElectronStore from "electron-store";
import { getLibraryPath } from "../utils/get-library-path";

type UserKeyBinding = {
  key: string;
  command: string;
};

export interface UserConfig {
  libraryPath: string;
  autoUpdate: boolean;
  vim: boolean;
  font: {
    fontFamily: string;
    fontSize: number;
    fontWeight: "normal" | "bold";
  };
  theme: "dark" | "light" | "system";
  window: {
    alwaysOnTop: boolean;
  };
  ai: {
    apiKey: string;
    enabled: boolean;
    model: string;
  };
  // { [Command | VimCommand]: string }
  keyBindings: Record<string, string>;
}

const schema: ElectronStore.Schema<UserConfig> = {
  theme: {
    type: "string",
    default: "dark"
  },
  vim: {
    type: "boolean",
    default: true
  },
  keyBindings: {
    type: "object",
    default: {}
  },
  font: {
    type: "object",
    default: {
      fontFamily: "-apple-system",
      fontSize: 14,
      fontWeight: "normal"
    },
    properties: {
      fontFamily: {
        type: "string",
        default: "-apple-system"
      },
      fontSize: {
        type: "number",
        default: 14
      },
      fontWeight: {
        type: "string",
        default: "normal"
      }
    }
  },
  libraryPath: {
    type: "string",
    default: getLibraryPath("")
  },
  autoUpdate: {
    type: "boolean",
    default: true
  },
  window: {
    type: "object",
    default: { alwaysOnTop: false },
    properties: {
      alwaysOnTop: {
        type: "boolean",
        default: false
      }
    }
  },
  ai: {
    type: "object",
    default: {
      apiKey: "",
      enabled: false,
      model: "gpt-3.5-turbo"
    },
    properties: {
      apiKey: {
        type: "string",
        default: ""
      },
      enabled: {
        type: "boolean",
        default: false
      },
      model: {
        type: "string",
        default: "gpt-3.5-turbo"
      }
    }
  }
};

export const store = new ElectronStore({ schema, name: "user-config" });
