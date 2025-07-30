import { app } from "electron";
import path from "path";

export function getResourceFilePath(fileName: string): string {
  const isDev = !app.isPackaged;

  return isDev
    ? path.join(process.cwd(), `./resources/${fileName}`)
    : path.join(process.resourcesPath, fileName);
}
