import { jsonLanguage } from "@codemirror/lang-json";
import { pythonLanguage } from "@codemirror/lang-python";
import {
  javascriptLanguage,
  jsxLanguage,
  tsxLanguage,
  typescriptLanguage
} from "@codemirror/lang-javascript";
import { htmlLanguage } from "@codemirror/lang-html";
import { StandardSQL } from "@codemirror/lang-sql";
import { markdownLanguage } from "@codemirror/lang-markdown";
import { lezerLanguage } from "@codemirror/lang-lezer";
import { phpLanguage } from "@codemirror/lang-php";
import { cssLanguage } from "@codemirror/lang-css";

import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";

import typescriptPlugin from "prettier/plugins/typescript";
import babelPrettierPlugin from "prettier/plugins/babel";
import htmlPrettierPlugin from "prettier/plugins/html";
import cssPrettierPlugin from "prettier/plugins/postcss";
import markdownPrettierPlugin from "prettier/plugins/markdown";
import yamlPrettierPlugin from "prettier/plugins/yaml";
import * as prettierPluginEstree from "prettier/plugins/estree";
import { Parser } from "@lezer/common";
import { LRParser } from "@lezer/lr";

class Language {
  token: string;
  name: string;
  parser: LRParser | Parser | null;
  guesslang: string | null;
  prettier: { parser: string; plugins: unknown[] } | null;

  /**
   * @param token: The token used to identify the language in the buffer content
   * @param name: The name of the language
   * @param parser: The Lezer parser used to parse the language
   * @param guesslang: The name of the language as used by the guesslang library
   * @param prettier: The prettier configuration for the language (if any)
   */
  constructor({
    token,
    name,
    parser,
    guesslang,
    prettier
  }: {
    token: string;
    name: string;
    parser: LRParser | Parser | null;
    guesslang: string | null;
    prettier?: { parser: string; plugins: unknown[] } | null;
  }) {
    this.token = token;
    this.name = name;
    this.parser = parser;
    this.guesslang = guesslang;
    this.prettier = prettier || null;
  }

  get supportsFormat() {
    return !!this.prettier;
  }
}

export const LANGUAGES = [
  new Language({
    token: "text",
    name: "Plain Text",
    parser: null,
    guesslang: null
  }),
  new Language({
    token: "math",
    name: "Math",
    parser: null,
    guesslang: null
  }),
  new Language({
    token: "json",
    name: "JSON",
    parser: jsonLanguage.parser,
    guesslang: "json",
    prettier: { parser: "json-stringify", plugins: [babelPrettierPlugin, prettierPluginEstree] }
  }),
  new Language({
    token: "python",
    name: "Python",
    parser: pythonLanguage.parser,
    guesslang: "py"
  }),
  new Language({
    token: "html",
    name: "HTML",
    parser: htmlLanguage.parser,
    guesslang: "html",
    prettier: { parser: "html", plugins: [htmlPrettierPlugin] }
  }),
  new Language({
    token: "sql",
    name: "SQL",
    parser: StandardSQL.language.parser,
    guesslang: "sql"
  }),
  new Language({
    token: "markdown",
    name: "Markdown",
    parser: markdownLanguage.parser,
    guesslang: "md",
    prettier: { parser: "markdown", plugins: [markdownPrettierPlugin] }
  }),
  new Language({
    token: "lezer",
    name: "Lezer",
    parser: lezerLanguage.parser,
    guesslang: null
  }),
  new Language({
    token: "php",
    name: "PHP",
    parser: phpLanguage.configure({ top: "Program" }).parser,
    guesslang: "php"
  }),
  new Language({
    token: "css",
    name: "CSS",
    parser: cssLanguage.parser,
    guesslang: "css",
    prettier: { parser: "css", plugins: [cssPrettierPlugin] }
  }),
  new Language({
    token: "shell",
    name: "Shell",
    parser: StreamLanguage.define(shell).parser,
    guesslang: "sh"
  }),
  new Language({
    token: "yaml",
    name: "YAML",
    parser: StreamLanguage.define(yaml).parser,
    guesslang: "yaml",
    prettier: { parser: "yaml", plugins: [yamlPrettierPlugin] }
  }),
  new Language({
    token: "javascript",
    name: "JavaScript",
    parser: javascriptLanguage.parser,
    guesslang: "js",
    prettier: { parser: "babel", plugins: [babelPrettierPlugin, prettierPluginEstree] }
  }),
  new Language({
    token: "jsx",
    name: "JSX",
    parser: jsxLanguage.parser,
    guesslang: null,
    prettier: { parser: "babel", plugins: [babelPrettierPlugin, prettierPluginEstree] }
  }),
  new Language({
    token: "typescript",
    name: "TypeScript",
    parser: typescriptLanguage.parser,
    guesslang: "ts",
    prettier: { parser: "typescript", plugins: [typescriptPlugin, prettierPluginEstree] }
  }),
  new Language({
    token: "tsx",
    name: "TSX",
    parser: tsxLanguage.parser,
    guesslang: null,
    prettier: { parser: "typescript", plugins: [typescriptPlugin, prettierPluginEstree] }
  })
];

const languageMapping = Object.fromEntries(LANGUAGES.map((l) => [l.token, l]));

export const displayLanguages = LANGUAGES.map((lang) => ({
  token: lang.token,
  name: lang.name
}));

export function getLanguage(token: string) {
  return languageMapping[token];
}
