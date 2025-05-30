import { create } from "zustand";
import { FormInputs } from "../components/settings/schema";

type AppState = {
  userSettings: FormInputs;
  isSettingsDialogOpen: boolean;
};

type AppStore = AppState & {
  saveUserSettings: (update: Partial<AppState["userSettings"]>) => void;
  toggleCopilot: () => void;
  toggleSettingsDialog: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isSettingsDialogOpen: false,
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
      alwaysOnTop: false
    },
    ai: {
      enabled: false,
      apiKey: "",
      model: "gpt-3.5-turbo"
    }
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
  }
}));

useAppStore.subscribe((state) => {
  window.api.settings.saveUserConfig(state.userSettings);
});
