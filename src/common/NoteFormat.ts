const FORMAT_VERSION = "1.0.0";

type NoteMetadata = {
  name?: string;
  formatVersion: string;
  folds?: Array<{ from: number; to: number }>;
  cursors?: {
    ranges: {
      from: number;
      to: number;
    };
  };
};

export class NoteFormat {
  content: string;
  metadata: NoteMetadata;

  constructor() {
    this.content = "";
    this.metadata = { formatVersion: "0.0.0" };
  }

  static load(data: string): NoteFormat {
    const note = new NoteFormat();

    note.content = data;
    const firstSeparator = data.indexOf("\n∞∞∞");

    if (firstSeparator !== -1) {
      const metadataContent = data.slice(0, firstSeparator).trim();

      if (metadataContent !== "") {
        note.metadata = JSON.parse(metadataContent);
      }

      note.content = data.slice(firstSeparator);
    }

    return note;
  }

  serialize() {
    this.metadata.formatVersion = FORMAT_VERSION;

    return JSON.stringify(this.metadata) + this.content;
  }

  set cursors(cursors: NoteMetadata["cursors"]) {
    this.metadata.cursors = cursors;
  }

  get cursors() {
    return this.metadata.cursors;
  }
}
