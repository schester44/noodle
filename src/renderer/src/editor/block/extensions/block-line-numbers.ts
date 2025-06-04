import { lineNumbers } from "@codemirror/view";
import { getBlockLineFromPos } from "../utils";

export const blockLineNumbers = lineNumbers({
  formatNumber(lineNo, state) {
    if (state.doc.lines >= lineNo) {
      const lineInfo = getBlockLineFromPos(state, state.doc.line(lineNo).from);
      if (lineInfo !== null) {
        return String(lineInfo.line);
      }
    }

    return "";
  }
});
