import { App } from "./App";
import { PluginSettingTab } from "./PluginSettingTab";

export abstract class Plugin<Settings = Record<string, unknown>> {
  app: App;
  settings: Settings = {} as Settings;

  constructor(app: App) {
    this.app = app;
  }

  abstract onload(): void;

  onunload(): void {}

  loadData(): Promise<Settings> {
    return Promise.resolve({});
  }

  saveData(data: Settings): Promise<void> {
    return Promise.resolve();
  }

  addSettingTab(tab: PluginSettingTab): void {
    // This method would typically add the setting tab to the app's UI
    console.log("Adding setting tab:", tab);
  }
}
