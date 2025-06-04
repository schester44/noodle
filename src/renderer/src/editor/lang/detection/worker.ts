// @ts-expect-error - doesn't have types
import { GuessLang } from "@ray-d-song/guesslang-js";

const GUESSLANG_LANGUAGES = [
  "json",
  "py",
  "html",
  "sql",
  "md",
  "java",
  "php",
  "css",
  "xml",
  "sh",
  "yaml",
  "toml",
  "js",
  "ts",
  "markdown"
];

console.log("🪵 worker loaded", GUESSLANG_LANGUAGES);

const guessLang = new GuessLang();

self.onmessage = (event: MessageEvent) => {
  const content = event.data.content;

  const trimmedContent = content.trim();

  if (
    (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) ||
    (trimmedContent.startsWith("[") && trimmedContent.endsWith("]"))
  ) {
    try {
      if (typeof JSON.parse(trimmedContent) === "object") {
        console.log("worker thinks its json");
        postMessage({
          guesslang: {
            language: "json",
            confidence: 1.0
          },
          content: content,
          idx: event.data.idx,
          path: event.data.path
        });
        return;
      }
    } catch (e) {
      console.log("🪵 e", e);
      // JSON could not be parsed, do nothing
    }
  }

  guessLang.runModel(content).then((result) => {
    console.log("Guessing language done:", result, result[0]?.languageId, result[0]?.confidence);

    if (result.length > 0) {
      const lang = result[0];

      if (GUESSLANG_LANGUAGES.includes(lang.languageId) && lang.confidence > 0.15) {
        postMessage({
          guesslang: {
            language: lang.languageId,
            confidence: lang.confidence
          },
          content: content,
          idx: event.data.idx,
          path: event.data.path
        });
        return;
      }
    }

    for (const lang of result) {
      if (GUESSLANG_LANGUAGES.includes(lang.languageId) && lang.confidence > 0.5) {
        postMessage({
          guesslang: {
            language: lang.languageId,
            confidence: lang.confidence
          },
          content: content,
          idx: event.data.idx,
          path: event.data.path
        });
        return;
      }
    }
  });
};
