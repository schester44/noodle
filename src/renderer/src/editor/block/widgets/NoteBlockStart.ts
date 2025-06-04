import { WidgetType } from "@codemirror/view";

export class NoteBlockStart extends WidgetType {
  isFirst: boolean;

  constructor(isFirst: boolean) {
    super();
    this.isFirst = isFirst;
  }

  eq(other: NoteBlockStart) {
    return this.isFirst === other.isFirst;
  }

  toDOM() {
    const wrap = document.createElement("div");

    wrap.className = "editor-block-start" + (this.isFirst ? " first" : "");

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}
