import { create } from "zustand";
import { FormInputs } from "../components/settings/schema";
import { Keybind } from "@/editor/extensions/keymaps";

export type AppState = {
  userSettings: FormInputs;
  isSettingsDialogOpen: boolean;
  isSearching: boolean;
};

type AppStore = AppState & {
  saveUserSettings: (update: Partial<AppState["userSettings"]>) => void;
  toggleCopilot: () => void;
  toggleSettingsDialog: () => void;
  toggleSearchDialog: () => void;
  updateKeyBinding: (opt: Pick<Keybind, "command" | "keys">) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isSettingsDialogOpen: false,
  isSearching: false,
  userSettings: {
    libraryPath: "",
    autoUpdate: true,
    theme: "dark",
    vim: true,
    font: {
      fontFamily: "-apple-system",
      fontSize: 14,
      fontWeight: "normal"
    },
    window: {
      alwaysOnTop: false,
      showInDock: true
    },
    ai: {
      enabled: false,
      apiKey: "",
      model: "gpt-3.5-turbo",
      features: {
        promptEnabled: true,
        autoCompleteEnabled: true
      }
    },
    keyBindings: {}
  },
  updateKeyBinding: (opt) => {
    set((state) => {
      return {
        userSettings: {
          ...state.userSettings,
          keyBindings: {
            ...state.userSettings.keyBindings,
            [opt.command]: opt.keys
          }
        }
      };
    });
  },
  toggleSettingsDialog: () => {
    set((state) => ({
      isSettingsDialogOpen: !state.isSettingsDialogOpen
    }));
  },
  saveUserSettings: (update) => {
    set((state) => {
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...update
        }
      };
    });
  },
  toggleCopilot: () => {
    set((prev) => {
      return {
        ...prev,
        userSettings: {
          ...prev.userSettings,
          ai: {
            ...prev.userSettings.ai,
            enabled: !prev.userSettings.ai.enabled
          }
        }
      };
    });
  },
  toggleSearchDialog: () =>
    set((state) => ({
      isSearching: !state.isSearching
    }))
}));

useAppStore.subscribe((state) => {
  window.api.settings.saveUserConfig(state.userSettings);
});
