export class Setting {
  name: string | undefined;
  desc: string | undefined;

  constructor(private containerEl: HTMLElement) {}

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDesc(desc: string): this {
    this.desc = desc;
    return this;
  }

  addText(
    callback: (text: {
      setPlaceholder: (placeholder: string) => any;
      setValue: (value: string) => any;
      onChange: (callback: (value: string) => void) => void;
    }) => void
  ): this {
    const textInput = {
      setPlaceholder: (placeholder: string) => {
        console.log(`Placeholder set to: ${placeholder}`);
        return textInput;
      },
      setValue: (value: string) => {
        console.log(`Value set to: ${value}`);
        return textInput;
      },
      onChange: (callback: (value: string) => void) => {
        console.log("Change callback registered");
        return textInput;
      }
    };

    callback(textInput);
    return this;
  }
}
