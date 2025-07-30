import { exec } from "child_process";
import { untildify } from "./library";
import { realpathSync } from "node:fs";
import { getResourceFilePath } from "./utils/get-resource-file";
import log from "electron-log";

export type ParsedSearchResult = {
  file: string;
  line: number;
  content: string;
};

export const basepath = (basePath: string) => {
  basePath = untildify(basePath);

  return realpathSync(basePath);
};

export async function searchNotes({
  path,
  query
}: {
  path: string;
  query: string;
}): Promise<ParsedSearchResult[]> {
  const rgPath = getResourceFilePath("rg");

  const rgCommand = `${rgPath} -i --json "${query}" ${basepath(path)}`;

  return new Promise((resolve, reject) => {
    log.debug("Searching notes with command:", rgCommand);

    exec(rgCommand, (error, stdout, stderr) => {
      log.debug("Ripgrep output:", stdout);
      log.debug("Ripgrep error output:", stderr);
      log.debug("Ripgrep error:", error);
      if (error) return reject(stderr);

      // slicing because rg --max-count doesnt seem to work.
      const results = parseRipgrepJson(stdout.trim()).slice(0, 20);

      resolve(results);
    });
  });
}

function parseRipgrepJson(output: string): ParsedSearchResult[] {
  return output
    .split("\n")
    .map((line) => {
      try {
        const entry = JSON.parse(line);
        if (entry.type !== "match") return null;

        // don't include metadata
        if (entry.data.lines.text.includes('{"formatVersion":')) return null;

        // FIXME: Why does includes(NOTE_BLOCK_DELIMITER) not work?
        // if (entry.data.lines.text.incudes(NOTE_BLOCK_DELIMITER)) return null;

        return {
          file: entry.data.path.text,
          line: entry.data.line_number,
          content: entry.data.lines.text.trim()
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ParsedSearchResult[];
}
