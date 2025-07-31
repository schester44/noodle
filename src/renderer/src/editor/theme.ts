import { EditorView } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { APPNAME } from "@common/constants";
import { darkPalette } from "./base-theme";

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const darkTheme = EditorView.theme(
  {
    ".editor-blocks-layer .block-even": {
      background: darkPalette.background,
      borderTop: "1px solid #11232E"
    },
    ".editor-blocks-layer .block-odd": {
      background: darkPalette.background2,
      borderTop: "1px solid #11232E"
    },
    ".cm-selectionLayer .cm-selectionBackground": {
      backgroundColor: `${darkPalette.selection} !important`
    },
    ".cm-selectionMatch": {
      backgroundColor: "#50606D"
    },
    ".cm-searchMatch": {
      background: `transparent !important`,
      outline: `1px solid ${darkPalette.orange}`
    },
    [`.${APPNAME}-link`]: {
      color: darkPalette.paleBlue,
      textDecoration: "underline",
      cursor: "pointer"
    },
    [`&.cm-prompt-active .cm-fat-cursor`]: {
      display: "none !important"
    },
    [`&.cm-meta-hover .${APPNAME}-link:hover`]: {
      color: darkPalette.orange
    },
    [`.${APPNAME}-markdown-link`]: {
      color: darkPalette.paleBlue,
      textDecoration: "underline",
      cursor: "pointer"
    },
    [`&.cm-meta-hover .${APPNAME}-markdown-link:hover`]: {
      color: darkPalette.orange
    },
    [`.${APPNAME}-separator`]: {
      height: "2px",
      backgroundColor: darkPalette.dimText
    },
    [`.${APPNAME}-separator[data-highlight=true]`]: {
      backgroundColor: darkPalette.orange
    },
    ".cm-activeLine.editor-empty-block-selected": {
      "background-color": "#ff0000"
    },
    ".cm-gutters": {
      backgroundColor: "rgba(42, 42, 55, 0.2)"
    },
    ".editor-math-result": {
      background: darkPalette.purple,
      borderRadius: "4px",
      marginLeft: "4px",
      padding: "1px 4px",
      color: darkPalette.background2,
      fontSize: "12px",
      fontWeight: "bold"
    },
    ".cm-gutterElement": {
      color: darkPalette.dimText
    },
    ".cm-gutterElement.cm-activeLineGutter": {
      background: "transparent",
      color: darkPalette.orange
    },
    ".editor-math-result-copied": {
      color: "#4EFF78"
    },
    ".cm-line": {
      color: "#FFF"
    },
    "&:not(.cm-focused) .cm-vimCursorLayer .cm-fat-cursor": {
      outline: `1px solid ${darkPalette.yellow}`,
      background: "transparent",
      color: "transparent !important"
    },
    "& .cm-vimCursorLayer .cm-fat-cursor": {
      background: `${darkPalette.yellow}`,
      color: "black !important"
    },
    ".cm-cursor": {
      borderLeftColor: `${darkPalette.yellow} !important`
    },
    ".cm-activeLine": {
      backgroundColor: "transparent"
    }
  },
  { dark: true }
);

export const lightTheme = EditorView.theme(
  {
    ".editor-blocks-layer .block-even": {
      background: "#fff",
      borderTop: "1px solid #ddd"
    },
    ".editor-blocks-layer .block-odd": {
      background: "#efefef",
      borderTop: "1px solid #ddd"
    },
    ".cm-selectionMatch": {
      backgroundColor: "#50606D"
      //color: base01
    },
    ".cm-activeLine.editor-empty-block-selected": {
      "background-color": "#ff0000"
    },
    ".cm-gutters": {
      backgroundColor: "transparent"
    },
    ".editor-math-result": {
      background: "#696969",
      borderRadius: "4px",
      marginLeft: "4px",
      padding: "0px 4px",
      color: "#fff",
      fontSize: "10px"
    },
    ".editor-math-result-copied": {
      color: "#4EFF78"
    }
  },
  { dark: false }
);

export const baseTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    height: "100%"
  },
  ".cm-layer.cm-selectionLayer": {
    zIndex: `-1 !important`
  },
  ".cm-scroller": {
    overflow: "auto"
  },
  ".cm-gutter.cm-lineNumbers": {
    paddingLeft: "7px"
  },
  ".cm-gutter.cm-foldGutter": {
    paddingRight: "7px"
  },
  ".cm-foldGutter .cm-gutterElement": {
    opacity: 0,
    transition: "opacity 250ms"
  },
  ".cm-foldPlaceholder": {
    background: "#53536C",
    borderColor: "#53536C",
    marginLeft: "4px",
    color: "black"
  },
  ".cm-gutters:hover .cm-gutterElement": {
    opacity: 1
  },
  ".editor-block-start": {
    height: "12px"
  },
  ".editor-block-start.first": {
    height: "0px"
  },
  ".editor-blocks-layer": {
    width: "100%"
  },
  ".editor-blocks-layer .block-even, .editor-blocks-layer .block-odd": {
    width: "100%",
    boxSizing: "content-box"
  },
  ".editor-blocks-layer .block-even:first-child": {
    borderTop: "none"
  },
  ".cm-line": {
    position: "relative"
  },
  ".editor-actions": {
    fontSize: "12px",
    position: "absolute",
    right: "0px"
  },
  // FIXME: This should come from a theme compartment in the ai extension
  ".ai-response-highlight": {
    background: "transarent",
    borderRadius: "2px",
    animation: "aiResponseReveal .5s ease-out forwards"
  },
  "@keyframes aiResponseReveal": {
    "0%": {
      background: "rgba(126, 180, 201, 0.2)",
      transform: "scale(1.02)"
    },
    "50%": {
      background: "rgba(126, 180, 201, 0.1)",
      transform: "scale(1.01)"
    },
    "100%": {
      background: "transparent",
      transform: "scale(1)",
      boxShadow: "none"
    }
  }
});

type FontThemeAttributes = {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
};

export const createFontTheme = ({ fontFamily, fontSize, fontWeight }: FontThemeAttributes) => {
  return EditorView.theme({
    ".cm-scroller": {
      fontFamily: `"${fontFamily}", -apple-system, sans-serif`,
      fontSize: `${fontSize}px`,
      fontWeight
    }
  });
};

const themeCompartment = new Compartment();
const fontCompartment = new Compartment();

export function updateEditorTheme(view: EditorView, theme: "dark" | "light" | "system") {
  view.dispatch({
    effects: themeCompartment.reconfigure(theme === "dark" ? darkTheme : lightTheme)
  });
}

export function updateEditorFont(
  view: EditorView,
  { fontFamily, fontSize, fontWeight }: FontThemeAttributes
) {
  view.dispatch({
    effects: fontCompartment.reconfigure(createFontTheme({ fontFamily, fontSize, fontWeight }))
  });
}

export const highlightThemeStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.paleBlue },
  { tag: tags.heading2, fontSize: "1.2em", fontWeight: "bold", color: darkPalette.dullGreen },
  { tag: tags.heading3, fontSize: "1.2em", fontWeight: "bold", color: darkPalette.dullGreen },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  {
    tag: [tags.null, tags.special(tags.variableName)],
    color: darkPalette.warmPink,
    fontStyle: "italic"
  },
  { tag: tags.link, color: darkPalette.paleBlue, textDecoration: "underline" },

  { tag: [tags.keyword, tags.modifier], color: darkPalette.purple },
  {
    tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
    color: darkPalette.yellow
  },
  { tag: [tags.propertyName], color: darkPalette.paleBlue },
  { tag: [tags.function(tags.variableName)], color: darkPalette.paleBlue },
  { tag: [tags.variableName], color: darkPalette.lightYellow },

  { tag: [tags.labelName], color: darkPalette.red },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: darkPalette.yellow
  },
  { tag: [tags.definition(tags.name), tags.separator], color: darkPalette.paleBlue },
  {
    tag: [tags.definition(tags.variableName)],
    color: darkPalette.yellow
  },
  { tag: [tags.brace], color: darkPalette.dimText },
  {
    tag: [tags.annotation],
    color: darkPalette.dullGreen
  },
  {
    tag: [tags.number, tags.changed, tags.annotation, tags.self, tags.namespace],
    color: darkPalette.warmPink
  },
  {
    tag: [tags.typeName, tags.className],
    color: darkPalette.dullGreen
  },
  {
    tag: [tags.operator],
    color: darkPalette.purple
  },
  { tag: [tags.operatorKeyword], color: darkPalette.purple, fontStyle: "italic" },
  {
    tag: [tags.tagName],
    color: darkPalette.paleBlue
  },
  {
    tag: [tags.bracket],
    color: darkPalette.steelBlue
  },
  {
    tag: [tags.attributeName],
    color: darkPalette.paleBlue
  },
  {
    tag: [tags.regexp],
    color: darkPalette.red
  },
  {
    tag: [tags.quote],
    color: darkPalette.orange
  },
  { tag: [tags.string], color: darkPalette.green },
  {
    tag: tags.link,
    color: darkPalette.paleBlue,
    textDecoration: "underline",
    textUnderlinePosition: "under"
  },
  {
    tag: [tags.url, tags.escape, tags.special(tags.string)],
    color: darkPalette.paleBlue
  },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: darkPalette.dimText },
  { tag: tags.meta, color: darkPalette.dimText },
  { tag: tags.invalid, color: darkPalette.red, textDecoration: "line-through" },
  { tag: tags.atom, color: darkPalette.orange },
  { tag: tags.bool, color: darkPalette.warmPink },
  { tag: tags.processingInstruction, color: darkPalette.dimText }
]);

export function themeExtension(initialTheme: {
  theme: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}) {
  return [
    baseTheme,
    syntaxHighlighting(highlightThemeStyle),
    themeCompartment.of(initialTheme.theme === "dark" ? darkTheme : lightTheme),
    fontCompartment.of(
      createFontTheme({
        fontFamily: initialTheme.fontFamily,
        fontSize: initialTheme.fontSize,
        fontWeight: initialTheme.fontWeight
      })
    )
  ];
}
