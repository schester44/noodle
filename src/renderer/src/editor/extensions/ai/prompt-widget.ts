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
    const container = document.createElement("div");
    container.className = "ai-prompt-widget";
    container.style.cssText = `
      display: flex;
      align-items: center;
    `;

    if (this.isLoading) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: var(--muted-foreground);">
          <div class="animate-spin">⟳</div>
          <span>Working...</span>
        </div>
      `;
    } else {
      const header = document.createElement("div");
      header.style.cssText = `
       margin-right: 8px;
      `;

      header.innerHTML = `<span>✨</span>`;

      container.appendChild(header);

      const textarea = document.createElement("textarea");
      textarea.placeholder = this.selectedText
        ? "What would you like to do?"
        : "Ask AI for an assist...";
      textarea.style.cssText = `
        width: 100%;
        min-height: 25px;
        padding: 8px;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--background);
        color: var(--foreground);
        font-size: 14px;
        font-family: inherit;
        outline: none;
        resize: vertical;
        line-height: 1;
        box-shadow: 0 0 3px 2px rgba(147, 51, 234, 0.3);
      `;

      textarea.spellcheck = false;
      textarea.rows = 1;

      // Auto-resize textarea
      const autoResize = () => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
      };

      textarea.addEventListener("input", autoResize);

      container.appendChild(textarea);

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

    return container;
  }
}
