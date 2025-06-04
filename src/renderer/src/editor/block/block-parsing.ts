import { EditorState } from "@codemirror/state";
import { syntaxTree, syntaxTreeAvailable } from "@codemirror/language";
import { Note, Document, NoteDelimiter } from "../lang/parser.terms.js";
import { IterMode } from "@lezer/common";
import { logger } from "../../lib/logger.js";

/**
 * Get the blocks from the document state.
 * If the syntax tree is available, we'll extract the blocks from that. Otherwise
 * the blocks are parsed from the string contents of the document, which is much faster
 * than waiting for the tree parsing to finish.
 */
export function getBlocks(state: EditorState) {
  if (syntaxTreeAvailable(state, state.doc.length)) {
    return getBlocksFromSyntaxTree(state);
  } else {
    return getBlocksFromString(state);
  }
}

// tracks the size of the first delimiter
export let firstBlockDelimiterSize: number | undefined = undefined;

export function getBlocksFromSyntaxTree(state: EditorState) {
  const blocks: BlockState[] = [];
  const tree = syntaxTree(state);
  if (!tree) return blocks;

  tree.iterate({
    enter: (type) => {
      if (type.type.id == Document || type.type.id == Note) {
        return true;
      } else if (type.type.id === NoteDelimiter) {
        const langNode = type.node.getChild("NoteLanguage");
        if (!langNode) return false;

        const language = state.doc.sliceString(langNode.from, langNode.to);
        const isAuto = !!type.node.getChild("Auto");
        const contentNode = type.node.nextSibling;

        if (!contentNode) {
          logger.error("Error parsing block, no content node found", { type });
          return false;
        }

        blocks.push({
          language: {
            name: language,
            auto: isAuto
          },
          content: {
            from: contentNode?.from || type.from + 1,
            to: contentNode?.to
          },
          delimiter: {
            from: type.from,
            to: type.to
          },
          range: {
            from: type.node.from,
            to: contentNode?.to
          }
        });
        return false;
      }
      return false;
    },
    mode: IterMode.IgnoreMounts
  });

  firstBlockDelimiterSize = blocks[0]?.delimiter.to;

  return blocks;
}

export function getBlocksFromString(state: EditorState) {
  const blocks: BlockState[] = [];
  const doc = state.doc;

  if (doc.length === 0) {
    return [];
  }

  const content = doc.sliceString(0, doc.length);
  const delim = "\n∞∞∞";

  let pos = 0;

  while (pos < doc.length) {
    const blockStart = content.indexOf(delim, pos);

    if (blockStart != pos) {
      console.error("Error parsing blocks, expected delimiter at", pos);
      break;
    }

    const langStart = blockStart + delim.length;
    const delimiterEnd = content.indexOf("\n", langStart);

    if (delimiterEnd < 0) {
      console.error("Error parsing blocks. Delimiter didn't end with newline", { content });
      break;
    }

    const langFull = content.substring(langStart, delimiterEnd);
    let auto = false;
    let lang = langFull;

    if (langFull.endsWith("-a")) {
      auto = true;
      lang = langFull.substring(0, langFull.length - 2);
    }

    const contentFrom = delimiterEnd + 1;

    let blockEnd = content.indexOf(delim, contentFrom);

    if (blockEnd < 0) {
      blockEnd = doc.length;
    }

    const block: BlockState = {
      language: {
        name: lang,
        auto: auto
      },
      content: {
        from: contentFrom,
        to: blockEnd
      },
      delimiter: {
        from: blockStart,
        to: delimiterEnd + 1
      },
      range: {
        from: blockStart,
        to: blockEnd
      }
    };

    blocks.push(block);
    pos = blockEnd;
  }

  return blocks;
}

export type BlockState = {
  content: {
    from: number;
    to: number;
  };
  delimiter: {
    from: number;
    to: number;
  };
  range: { from: number; to: number };
  language: { name: string; auto: boolean };
};
