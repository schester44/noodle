import { Plugin, PluginSettingTab, Setting, App } from "../system";

type APIPluginSettings = {
  apiKey: string;
  aiModel: string;
};

export default class AIPlugin extends Plugin<APIPluginSettings> {
  async onload() {
    console.log("AI Plugin loaded");
    await this.loadSettings();

    this.addSettingTab(new AISettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = await this.loadData();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class AISettingTab extends PluginSettingTab {
  plugin: AIPlugin;

  constructor(app: App, plugin: AIPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    // Implement the UI for settings here
    console.log("Display AI settings");

    const containerEl = this.containerEl;

    new Setting(containerEl)
      .setName("Date format")
      .setDesc("Default date format")
      .addText((text) =>
        text
          .setPlaceholder("MMMM dd, yyyy")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
