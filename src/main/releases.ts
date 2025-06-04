import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { app } from "electron";

let interval: NodeJS.Timeout | null = null;

autoUpdater.on("checking-for-update", () => {
  log.debug("Checking for update");
});

autoUpdater.on("update-available", () => {
  log.debug("Update available.");
});

autoUpdater.on("update-not-available", () => {
  log.debug("Update not available.");
});

autoUpdater.on("error", (err) => {
  log.debug("Error in auto-updater. " + err);
});

autoUpdater.on("update-downloaded", () => {
  log.debug("Update downloaded...installing");

  autoUpdater.quitAndInstall();
});

export async function getLatestVersionInfo() {
  autoUpdater.autoDownload = false; // Disable auto-download for this check
  const versionInfo = await autoUpdater.checkForUpdates();
  autoUpdater.autoDownload = true; // Re-enable auto-download

  return versionInfo?.updateInfo.version || app.getVersion();
}

export function checkForUpdates({ enabled }: { enabled: boolean }) {
  autoUpdater.autoDownload = enabled;

  if (interval) {
    clearInterval(interval);
  }

  if (!enabled) {
    log.debug("Auto-updates are disabled.");
    return;
  }

  // check on startup
  autoUpdater.checkForUpdates();

  interval = setInterval(
    () => {
      autoUpdater.checkForUpdates();
    },
    60 * 60 * 1000
  );
}
