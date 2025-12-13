"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  H1Icon,
  H2Icon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/solid";
import { GrBlockQuote } from "react-icons/gr";
export default function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-t border-gray-300 py-2 mb-4">
      {/* Text formatting */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <BoldIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <ItalicIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <UnderlineIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-black/20 mx-2" />

      {/* Headings */}
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h1"));
            }
          })
        }
      >
        <H1Icon className="w-5 h-5" />
      </button>

      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h2"));
            }
          })
        }
      >
        <H2Icon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-black/20 mx-2" />

      {/* Lists */}
      <button
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)}
      >
        <NumberedListIcon className="w-5 h-5" />
      </button>

      <span className="w-px h-5 bg-black/20 mx-2" />

      {/* Quote & Code */}
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          })
        }
      >
        <GrBlockQuote size={20} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
      >
        <CodeBracketIcon className="w-5 h-5" />
      </button>

      {/* Clear */}
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.formatText("bold", false);
              selection.formatText("italic", false);
              selection.formatText("underline", false);
              selection.formatText("code", false);
            }
          })
        }
      >
        Clear
      </button>
    </div>
  );
}
