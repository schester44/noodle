import { autoUpdater } from "electron-updater";
import log from "electron-log";

let interval: NodeJS.Timeout | null = null;

export function checkForUpdates({ enabled }: { enabled: boolean }) {
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
}
