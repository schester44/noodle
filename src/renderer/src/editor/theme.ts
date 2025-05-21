import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Compartment } from "@codemirror/state";

const darkPalette = {
  background: "#1F1F28",
  background2: "#1A1A22",
  dimText: "#53536C",
  orange: "#FF9F66",
  yellow: "#C9C093",
  dullGreen: "#79A79F",
  paleBlue: "#7EB4C9"
};

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
    ".cm-selectionMatch": {
      backgroundColor: "#50606D"
    },
    ".cm-activeLine.editor-empty-block-selected": {
      "background-color": "#ff0000"
    },
    ".cm-gutters": {
      backgroundColor: "rgba(42, 42, 55, 0.2)"
    },
    ".editor-math-result": {
      background: darkPalette.dullGreen,
      borderRadius: "4px",
      marginLeft: "4px",
      padding: "1px 4px",
      color: "#fff",
      fontSize: "12px"
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
    ".cm-fat-cursor": {
      background: `${darkPalette.yellow} !important`,
      color: "black !important"
    },
    ".cm-cursor": {
      borderLeftColor: `${darkPalette.yellow} !important`
    },
    ".cm-activeLine": {
      backgroundColor: "transparent"
    },
    ".cm-checkbox": {
      appearance: "none",
      width: "0.75rem",
      height: "0.75rem",
      background: "transparent",
      outline: `1.5px solid ${darkPalette.orange}`,
      borderRadius: "4px"
    },
    ".cm-checkbox:checked": {
      backgroundColor: darkPalette.orange,
      border: "1px solid black"
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
    backgroundColor: "transparent"
  },
  ".cm-editor": {
    height: "100vh"
  },
  ".cm-content .cm-gutter": {
    height: "100vh"
  },
  ".cm-scroller": {
    overflow: "auto",
    height: "100vh"
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

export const markdownHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.paleBlue },
  { tag: t.heading2, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.dullGreen },
  { tag: t.heading3, fontSize: "1.3em", fontWeight: "bold", color: darkPalette.dullGreen }
]);

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

export function themeExtension(initialTheme: {
  theme: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}) {
  return [
    baseTheme,
    syntaxHighlighting(markdownHighlightStyle),
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
