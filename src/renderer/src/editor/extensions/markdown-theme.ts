import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { darkPalette } from "../base-theme";

export const markdownHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.paleBlue },
  { tag: tags.heading2, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.dullGreen },
  { tag: tags.heading3, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.dullGreen },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.link, color: darkPalette.paleBlue, textDecoration: "underline" }
]);

export function markdownThemeExtension() {
  return [syntaxHighlighting(markdownHighlightStyle)];
}
