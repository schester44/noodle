import { WidgetType } from "@codemirror/view";

export class PromptWidget extends WidgetType {
  private isLoading: boolean = false;
  private selectedText?: string;
  private onSubmit: (prompt: string) => void;
  private onClose: () => void;

  constructor(config: {
    onSubmit: (prompt: string) => void;
    onClose: () => void;
    isLoading?: boolean;
    selectedText?: string;
  }) {
    super();

    this.onSubmit = config.onSubmit;
    this.onClose = config.onClose;
    this.isLoading = config.isLoading || false;
    this.selectedText = config.selectedText;
  }

  toDOM() {
    const widget = document.createElement("div");

    widget.className = "ai-prompt-widget";

    if (this.isLoading) {
      widget.innerHTML = `
        <div class="ai-prompt-loader">
          <div class="animate-spin">⟳</div>
          <span>Working...</span>
        </div>
      `;
    } else {
      const container = document.createElement("div");
      const icon = document.createElement("div");

      icon.className = "ai-prompt-icon";
      icon.innerHTML = `<span>✨</span>`;

      container.className = "ai-prompt-container";
      container.appendChild(icon);

      const textarea = document.createElement("textarea");
      textarea.placeholder = this.selectedText
        ? "What would you like to do?"
        : "Ask AI for an assist...";

      textarea.className = "ai-prompt-input";

      textarea.spellcheck = false;
      textarea.rows = 1;

      // Auto-resize textarea
      const autoResize = () => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
      };

      textarea.addEventListener("input", autoResize);

      container.appendChild(textarea);
      widget.appendChild(container);

      // Focus the textarea immediately
      setTimeout(() => {
        textarea.focus();
        autoResize();
      }, 0);

      textarea.addEventListener("keydown", (e) => {
        e.stopPropagation();

        if (e.key === "Enter") {
          if (e.shiftKey) {
            // Allow Shift+Enter for new lines (default behavior)
            return;
          } else {
            // Enter without Shift submits
            e.preventDefault();

            if (textarea.value.trim()) {
              this.onSubmit(textarea.value.trim());
            }
          }
        } else if (e.key === "Escape") {
          this.onClose();
        }
      });
    }

    return widget;
  }
}
