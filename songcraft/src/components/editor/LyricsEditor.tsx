import React, { useMemo, useState } from "react";
import {
  createPlateEditor,
  Plate,
  PlateProvider,
  PlateEditor,
} from "@udecode/plate-common";
import {
  createParagraphPlugin,
  createHeadingPlugin,
  createListPlugin,
  createBlockquotePlugin,
} from "@udecode/plate-basic-elements";
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  createCodePlugin,
} from "@udecode/plate-basic-marks";
import {
  createHeadingPlugin as createHeadingPluginV2,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
} from "@udecode/plate-heading";
import {
  createListPlugin as createListPluginV2,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LI,
} from "@udecode/plate-list";
import { createToolbarPlugin } from "@udecode/plate-toolbar";
import { createFloatingPlugin } from "@udecode/plate-floating";
import { createHistoryPlugin } from "slate-history";
import {
  createVersePlugin,
  createChorusPlugin,
  createBridgePlugin,
  createPreChorusPlugin,
  createOutroPlugin,
  ELEMENT_VERSE,
  ELEMENT_CHORUS,
  ELEMENT_BRIDGE,
  ELEMENT_PRE_CHORUS,
  ELEMENT_OUTRO,
} from "./LyricsBlocks";

interface LyricsEditorProps {
  initialValue?: unknown[];
  onChange?: (value: unknown[]) => void;
  placeholder?: string;
  className?: string;
}

export function LyricsEditor({
  initialValue,
  onChange,
  placeholder = "Start writing your lyrics...",
  className = "",
}: LyricsEditorProps) {
  const [value, setValue] = useState(
    initialValue || [
      {
        type: "p",
        children: [{ text: "" }],
      },
    ]
  );

  const editor = useMemo(() => {
    return createPlateEditor({
      plugins: [
        createHistoryPlugin(),
        createParagraphPlugin(),
        createHeadingPluginV2(),
        createListPluginV2(),
        createBlockquotePlugin(),
        createBoldPlugin(),
        createItalicPlugin(),
        createUnderlinePlugin(),
        createStrikethroughPlugin(),
        createCodePlugin(),
        createVersePlugin(),
        createChorusPlugin(),
        createBridgePlugin(),
        createPreChorusPlugin(),
        createOutroPlugin(),
        createToolbarPlugin(),
        createFloatingPlugin(),
      ],
    });
  }, []);

  const handleChange = (newValue: unknown[]) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`lyrics-editor ${className}`}>
      <PlateProvider editor={editor}>
        <Plate editor={editor} value={value} onChange={handleChange}>
          <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
            <PlateEditor placeholder={placeholder} className="outline-none" />
          </div>
        </Plate>
      </PlateProvider>
    </div>
  );
}

// Toolbar component for lyrics-specific actions
export function LyricsToolbar() {
  return (
    <div className="lyrics-toolbar flex gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          onClick={() => {
            // Insert verse block
            console.log("Insert verse");
          }}
        >
          📝 Verse
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          onClick={() => {
            // Insert chorus block
            console.log("Insert chorus");
          }}
        >
          🎵 Chorus
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          onClick={() => {
            // Insert bridge block
            console.log("Insert bridge");
          }}
        >
          🌉 Bridge
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          onClick={() => {
            // Insert pre-chorus block
            console.log("Insert pre-chorus");
          }}
        >
          ⚡ Pre-Chorus
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => {
            // Insert outro block
            console.log("Insert outro");
          }}
        >
          🎬 Outro
        </button>
      </div>

      <div className="flex gap-2 ml-auto">
        <button
          type="button"
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => {
            // Bold
            console.log("Bold");
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => {
            // Italic
            console.log("Italic");
          }}
        >
          <em>I</em>
        </button>
      </div>
    </div>
  );
}
