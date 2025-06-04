import os from "os";
import fs from "fs";
import { untildify } from "../library";

export function getLibraryPath(libraryPath: string): string {
  const path = !libraryPath.trim() ? `${os.homedir()}/noodle/library` : libraryPath;

  if (!fs.existsSync(untildify(path))) {
    fs.mkdirSync(untildify(path), { recursive: true });
  }

  return path;
}
