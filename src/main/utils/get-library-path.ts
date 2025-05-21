import os from "os";
import fs from "fs";

export function getLibraryPath(libraryPath: string): string {
  const path = !libraryPath.trim() ? `${os.homedir()}/noodle/library` : libraryPath;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  return path;
}
