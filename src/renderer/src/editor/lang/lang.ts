import { parser } from "./parser.js";
import { configureNesting } from "./nested-parser";

import { LRLanguage, LanguageSupport, foldNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

import { json } from "@codemirror/lang-json";

export const EditorLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        NoteDelimiter: t.tagName
      }),

      foldNodeProp.add({
        NoteContent(node) {
          return { from: node.from, to: node.to - 1 };
        }
      })
    ],
    wrap: configureNesting()
  }),
  languageData: {
    commentTokens: { line: ";" }
  }
});

export function langExtension() {
  const wrap = configureNesting();

  const lang = EditorLanguage.configure({ dialect: "", wrap: wrap });
  return [new LanguageSupport(lang, [json().support])];
}
