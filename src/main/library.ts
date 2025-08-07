import fs from "fs";
import fsp from "fs/promises";
import { join, basename, extname } from "path";
import os from "node:os";
import { ipcMain } from "electron";
import chokidar from "chokidar";
import { store } from "./store/app-config";
import { IPC_CHANNELS, NOTE_BLOCK_DELIMITER } from "@common/constants";

const DEFAULT_FILE_NAME = "noodle.txt";

export const initialContent = (name: string, template: "initial" | "daily" = "initial") => {
  if (template === "daily") {
    const date = formatDate(new Date(), { includeTime: false });

    return `
{"formatVersion":"1.0.0","name":"${name}"}
${NOTE_BLOCK_DELIMITER}markdown-a
# ${date}
`;
  }

  return `
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
};

export class FileLibrary {
  private basePath: string;
  private files: Record<string, NoteBuffer> = {};
  private watcher: chokidar.FSWatcher | null = null;
  private onFileSystemChange?: () => void;

  constructor(options: { libraryPath: string; onFileSystemChange?: () => void }) {
    const basePath = untildify(options.libraryPath);

    if (!isDirectory(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    this.basePath = fs.realpathSync(basePath);
    this.onFileSystemChange = options.onFileSystemChange;

    const defaultFilePath = join(this.basePath, DEFAULT_FILE_NAME);

    if (!fileExists(join(this.basePath, DEFAULT_FILE_NAME))) {
      fs.writeFileSync(defaultFilePath, initialContent(DEFAULT_FILE_NAME), "utf8");
    }

    if (options.onFileSystemChange) {
      this.setupFileWatcher();
    }
  }

  private setupFileWatcher() {
    console.log("\x1b[33m%s\x1b[0m", "🪵 this.basePath", this.basePath);

    this.watcher = chokidar.watch("*.txt", {
      cwd: this.basePath,
      persistent: true,
      ignoreInitial: true,
      depth: 10
    });

    this.watcher
      .on("add", (path: string) => {
        console.log(`File added: ${path}`);
        this.onFileSystemChange?.();
      })
      .on("unlink", (path: string) => {
        console.log(`File removed: ${path}`);
        const fullPath = join(this.basePath, path);
        delete this.files[fullPath];
        this.onFileSystemChange?.();
      })
      .on("change", (path: string) => {
        console.log(`File changed: ${path}`);
        this.onFileSystemChange?.();
      });
  }

  destroy() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  async createNew(opts?: { file?: string; template?: "initial" | "daily" }) {
    const fileName = opts?.file || formatDate(new Date()) + ".txt";

    const newFilePath = join(this.basePath, fileName);

    if (fileExists(newFilePath)) {
      return { path: newFilePath };
    }

    fs.writeFileSync(
      newFilePath,
      initialContent(fileName.replace(".txt", ""), opts?.template),
      "utf8"
    );

    this.files[newFilePath] = new NoteBuffer(newFilePath);

    return { path: newFilePath };
  }

  load(file: string) {
    console.log("Loading", file);
    store.set("lastOpenedFile", file);

    if (this.files[file]) {
      return this.files[file].load();
    }

    this.files[file] = new NoteBuffer(file);

    return this.files[file].load();
  }

  save(name: string, content: string) {
    console.log("Saving", name);
    if (!this.files[name]) {
      throw new Error(`File ${name} not loaded`);
    }

    return this.files[name].save(content);
  }

  async getFileTree() {
    return buildFileTree(this.basePath);
  }

  async getAll() {
    const files = await getFiles(this.basePath);

    const metadataList = await Promise.all(
      files.map(({ fullpath }) => {
        const buffer = new NoteBuffer(fullpath);

        return buffer.metadata();
      })
    );

    return files.map((file, i) => {
      return {
        ...file,
        ...metadataList[i]
      };
    });
  }
}

class NoteBuffer {
  constructor(private path: string) {}

  async read() {
    const data = await fsp.readFile(this.path, "utf8");

    return data;
  }

  async load() {
    const content = await this.read();

    return content;
  }

  async save(content: string) {
    await fsp.writeFile(this.path, content, "utf8");

    return true;
  }

  async metadata() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunks: any[] = [];

    for await (const chunk of fs.createReadStream(this.path, { start: 0, end: 4000 })) {
      chunks.push(chunk);
    }

    const headContent = Buffer.concat(chunks).toString("utf8");

    const firstSeparator = headContent.indexOf("\n∞∞∞");

    if (firstSeparator === -1) {
      return null;
    }

    try {
      const metadata = JSON.parse(headContent.slice(0, firstSeparator).trim());

      return { name: metadata.name, tags: metadata.tags || [] };
    } catch {
      return {};
    }
  }

  exists() {
    return fs.existsSync(this.path);
  }
}

async function getFiles(path: string) {
  const files = await fsp.readdir(path, { withFileTypes: true });
  const fileList: Array<{ file: string; path: string; fullpath: string }> = [];

  for (const file of files) {
    const fullPath = join(path, file.name);

    if (file.isDirectory()) {
      const subFiles = await getFiles(fullPath);
      fileList.push(...subFiles);
    } else if (file.isFile() && file.name.endsWith(".txt")) {
      fileList.push({ fullpath: join(path, file.name), path, file: file.name });
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

function formatDate(date: Date, options: { includeTime?: boolean } = {}) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  let formattedDate = `${year}-${month}-${day}`;

  if (options.includeTime !== false) {
    formattedDate += `-${hours}${minutes}`;
  }

  return formattedDate;
}

type FileTreeItem = {
  path: string;
  name: string;
  type: "directory" | "file";
  children?: FileTreeItem[];
};

async function buildFileTree(rootDir: string): Promise<FileTreeItem | null> {
  const stat = await fs.promises.stat(rootDir);

  if (stat.isFile()) {
    if (extname(rootDir) !== ".txt") return null;

    return {
      name: basename(rootDir),
      path: rootDir,
      type: "file"
    };
  }

  const entries = await fs.promises.readdir(rootDir);
  const children = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(rootDir, entry);
      try {
        return await buildFileTree(fullPath);
      } catch {
        return null; // skip unreadable files
      }
    })
  );

  const validChildren = children.filter((c): c is FileTreeItem => c !== null);

  return {
    name: basename(rootDir),
    path: rootDir,
    type: "directory",
    children: validChildren
  };
}

export function setupFileLibraryEventListeners({ library }: { library: FileLibrary }) {
  ipcMain.handle(IPC_CHANNELS.CREATE_BUFFER, async (_, opts) => {
    return await library.createNew(opts);
  });
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

  ipcMain.handle(IPC_CHANNELS.GET_FILE_TREE, async () => {
    return await library.getFileTree();
  });
}
