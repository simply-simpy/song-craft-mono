import React, { useState } from "react";
import { LyricsEditor, LyricsToolbar } from "./LyricsEditor";

export function LyricsEditorDemo() {
  const [content, setContent] = useState([
    {
      type: "verse",
      children: [
        {
          type: "p",
          children: [{ text: "This is a verse block" }],
        },
      ],
    },
    {
      type: "chorus",
      children: [
        {
          type: "p",
          children: [{ text: "This is a chorus block" }],
        },
      ],
    },
    {
      type: "bridge",
      children: [
        {
          type: "p",
          children: [{ text: "This is a bridge block" }],
        },
      ],
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SongCraft Lyrics Editor Demo</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <LyricsToolbar />
        <LyricsEditor
          initialValue={content}
          onChange={setContent}
          placeholder="Start writing your lyrics... Use the toolbar above to add song sections."
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Current Content:</h3>
        <pre className="text-sm text-gray-600 overflow-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}
