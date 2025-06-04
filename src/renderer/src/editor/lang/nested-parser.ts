import { parseMixed } from "@lezer/common";
import { NoteInnerContent, NoteLanguage } from "./parser.terms.js";
import { LANGUAGES } from "../languages.js";

const languageMapping = Object.fromEntries(LANGUAGES.map((l) => [l.token, l.parser]));

export function configureNesting() {
  return parseMixed((node, input) => {
    const id = node.type.id;
    const noteLang = node.node.parent?.parent?.firstChild?.getChildren(NoteLanguage)[0];

    if (id !== NoteInnerContent) return null;
    if (node.node.from == node.node.to) return null;
    if (!noteLang) return null;

    const langName = input.read(noteLang?.from, noteLang?.to);

    if (langName in languageMapping && languageMapping[langName] !== null) {
      return {
        parser: languageMapping[langName]
      };
    }

    return null;
  });
}
