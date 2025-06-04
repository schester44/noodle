import { WidgetType } from "@codemirror/view";

export class MathResult extends WidgetType {
  displayResult: string;
  copyResult: string;

  constructor(displayResult: string, copyResult: string) {
    super();
    this.displayResult = displayResult;
    this.copyResult = copyResult;
  }

  eq(other: MathResult) {
    return other.displayResult == this.displayResult;
  }

  toDOM() {
    const wrap = document.createElement("span");
    const inner = document.createElement("span");
    wrap.className = "editor-math-result";

    inner.className = "inner";
    inner.innerHTML = this.displayResult;

    wrap.appendChild(inner);

    inner.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(this.copyResult);
      const copyElement = document.createElement("i");

      copyElement.className = "editor-math-result-copied";
      copyElement.innerHTML = " &#10003;"; // ASCII check mark
      wrap.appendChild(copyElement);

      copyElement.className = "editor-math-result-copied fade-out";

      setTimeout(() => {
        copyElement.remove();
      }, 1700);
    });
    return wrap;
  }
  ignoreEvent() {
    return false;
  }
}
