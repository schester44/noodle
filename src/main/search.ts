import { exec } from "child_process";
import { untildify } from "./library";
import { realpathSync } from "node:fs";

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
  const rgCommand = `rg -i --json "${query}" ${basepath(path)}`;

  return new Promise((resolve, reject) => {
    exec(rgCommand, (error, stdout, stderr) => {
      if (error) return reject(stderr);

      // slicing because rg --max-count doesnt seem to work.
      const results = parseRipgrepJson(stdout.trim()).slice(0, 20);
      console.log("\x1b[33m%s\x1b[0m %s", "🪵 results", results);

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
