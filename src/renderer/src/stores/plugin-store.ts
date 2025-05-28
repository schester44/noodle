import { create } from "zustand";
import { App, Plugin } from "@/plugins/system";

type Manifest = { id: string; name: string };

type PluginsState = {
  plugins: Array<{ plugin: Plugin; manifest: Manifest }>;
};

export type PluginsStoreActions = {
  loadPlugins: () => void;
};

type PluginsStore = PluginsState & PluginsStoreActions;

export const usePluginsStore = create<PluginsStore>((set) => ({
  plugins: [],
  loadPlugins: async () => {
    // todo: this would probably come from an arg
    const app = new App();

    const manifests = import.meta.glob("../plugins/**/manifest.json", {
      eager: true,
      import: "default"
    });

    const manifestEntries = Object.entries(manifests);

    const plugins: Array<{ plugin: Plugin; manifest: Manifest }> = [];

    for (const [path, manifest] of manifestEntries) {
      // TODO: validate manifest structure using a zod schema
      const Plugin = await import(/* @vite-ignore */ path.replace("manifest.json", "index.ts"));

      const instance = new Plugin.default(app);

      instance.onload();

      plugins.push({ plugin: instance, manifest: manifest as Manifest });
    }

    set({ plugins });
  }
}));
