import fs from "fs";
import fsp from "fs/promises";
import { join } from "path";
import os from "node:os";
import { ipcMain } from "electron";
import { store } from "./store/app-config";
import { IPC_CHANNELS, NOTE_BLOCK_DELIMITER } from "@common/constants";

const DEFAULT_FILE_NAME = "noodle.txt";

export const initialContent = (name: string) => `
{"formatVersion":"1.0.0","name":"${name}"}
${NOTE_BLOCK_DELIMITER}markdown-a
In Markdown blocks, lists with [x] and [ ] are rendered as checkboxes:

- [x] Get the day started
- [ ] Go to the gym
${NOTE_BLOCK_DELIMITER}math-a
This is a Math block. Here, rows are evaluated as math expressions.

radius = 5
area = radius^2 * PI
sqrt(9)

It also supports some basic unit conversions, including currencies:

13 inches in cm
time = 3900 seconds to minutes
time * 2
${NOTE_BLOCK_DELIMITER}markdown-a
`;

export class FileLibrary {
  private basePath: string;
  private files: Record<string, NoteBuffer> = {};

  constructor(basePath: string) {
    basePath = untildify(basePath);

    if (!isDirectory(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    this.basePath = fs.realpathSync(basePath);

    const defaultFilePath = join(this.basePath, DEFAULT_FILE_NAME);

    if (!fileExists(join(this.basePath, DEFAULT_FILE_NAME))) {
      fs.writeFileSync(defaultFilePath, initialContent(DEFAULT_FILE_NAME), "utf8");
    }
  }

  async createNew() {
    const newFileName = formatDate(new Date()) + ".txt";

    const newFilePath = join(this.basePath, newFileName);

    if (fileExists(newFilePath)) {
      throw new Error(`File ${newFileName} already exists`);
    }

    fs.writeFileSync(newFilePath, initialContent(newFileName), "utf8");

    this.files[newFileName] = new NoteBuffer({ fullPath: newFilePath });

    return { path: newFileName };
  }

  load(name: string) {
    store.set("lastOpenedFile", name);

    if (this.files[name]) {
      return this.files[name].load();
    }

    const fullPath = fs.realpathSync(join(this.basePath, name));

    this.files[name] = new NoteBuffer({ fullPath });

    return this.files[name].load();
  }

  save(name: string, content: string) {
    if (!this.files[name]) {
      throw new Error(`File ${name} not loaded`);
    }

    return this.files[name].save(content);
  }

  async getAll() {
    const files = await getFiles(this.basePath);

    const metadataList = await Promise.all(files.map(readNoteMetadata));

    return files.map((file, i) => {
      return {
        ...file,
        ...metadataList[i]
      };
    });
  }
}

class NoteBuffer {
  private fullPath: string;

  constructor({ fullPath }: { fullPath: string }) {
    this.fullPath = fullPath;
  }

  async read() {
    const data = await fsp.readFile(this.fullPath, "utf8");

    return data;
  }

  async load() {
    const content = await this.read();

    return content;
  }

  async save(content: string) {
    await fsp.writeFile(this.fullPath, content, "utf8");

    return true;
  }

  exists() {
    return fs.existsSync(this.fullPath);
  }
}

async function readNoteMetadata({ path, file }: { path: string; file: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chunks: any[] = [];

  for await (const chunk of fs.createReadStream(join(path, file), { start: 0, end: 4000 })) {
    chunks.push(chunk);
  }

  const headContent = Buffer.concat(chunks).toString("utf8");
  const firstSeparator = headContent.indexOf("\n∞∞∞");
  if (firstSeparator === -1) {
    return null;
  }
  try {
    const metadata = JSON.parse(headContent.slice(0, firstSeparator).trim());
    return { name: metadata.name, tags: metadata.tags };
  } catch {
    return {};
  }
}

async function getFiles(path: string) {
  const files = await fsp.readdir(path, { withFileTypes: true });
  const fileList: Array<{ file: string; path: string }> = [];

  for (const file of files) {
    const fullPath = join(path, file.name);

    if (file.isDirectory()) {
      const subFiles = await getFiles(fullPath);
      fileList.push(...subFiles);
    } else if (file.isFile() && file.name.endsWith(".txt")) {
      fileList.push({ file: file.name, path });
    }
  }
  return fileList;
}

function isDirectory(path: string) {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function fileExists(path: string) {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
}

export function untildify(path: string) {
  const homeDir = os.homedir();
  return homeDir ? path.replace(/^~(?=$|\/|\\)/, homeDir) : path;
}

function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}-${hours}${minutes}`;
}

export function setupFileLibraryEventListeners({ library }: { library: FileLibrary }) {
  ipcMain.handle(IPC_CHANNELS.NEW_BUFFER, async () => {
    return await library.createNew();
  });

  ipcMain.handle(IPC_CHANNELS.LOAD_BUFFER, async (_, file: string) => {
    return await library.load(file);
  });

  ipcMain.handle(
    IPC_CHANNELS.SAVE_BUFFER,
    async (_, { file, content }: { file: string; content: string }) => {
      return await library.save(file, content);
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_ALL_BUFFERS, async () => {
    return await library.getAll();
  });
}
