import { useMemo, useState, useEffect } from "react";

// Custom block types for song lyrics
export const ELEMENT_VERSE = "verse";
export const ELEMENT_CHORUS = "chorus";
export const ELEMENT_BRIDGE = "bridge";
export const ELEMENT_PRE_CHORUS = "pre_chorus";
export const ELEMENT_OUTRO = "outro";

interface LyricsEditorProps {
  initialValue?: unknown[];
  onChange?: (value: unknown[]) => void;
  placeholder?: string;
  className?: string;
}

// Simple lyrics block component
function LyricsBlock({
  type,
  children,
  className = "",
}: {
  type: string;
  children: React.ReactNode;
  className?: string;
}) {
  const getBlockStyles = (blockType: string) => {
    switch (blockType) {
      case ELEMENT_VERSE:
        return "bg-blue-50 border-l-4 border-blue-400";
      case ELEMENT_CHORUS:
        return "bg-yellow-50 border-l-4 border-yellow-400";
      case ELEMENT_BRIDGE:
        return "bg-purple-50 border-l-4 border-purple-400";
      case ELEMENT_PRE_CHORUS:
        return "bg-green-50 border-l-4 border-green-400";
      case ELEMENT_OUTRO:
        return "bg-gray-50 border-l-4 border-gray-400";
      default:
        return "bg-gray-50 border-l-4 border-gray-400";
    }
  };

  const getBlockLabel = (blockType: string) => {
    switch (blockType) {
      case ELEMENT_VERSE:
        return "Verse";
      case ELEMENT_CHORUS:
        return "Chorus";
      case ELEMENT_BRIDGE:
        return "Bridge";
      case ELEMENT_PRE_CHORUS:
        return "Pre-Chorus";
      case ELEMENT_OUTRO:
        return "Outro";
      default:
        return "Block";
    }
  };

  const getLabelColor = (blockType: string) => {
    switch (blockType) {
      case ELEMENT_VERSE:
        return "text-blue-600";
      case ELEMENT_CHORUS:
        return "text-yellow-600";
      case ELEMENT_BRIDGE:
        return "text-purple-600";
      case ELEMENT_PRE_CHORUS:
        return "text-green-600";
      case ELEMENT_OUTRO:
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`${getBlockStyles(
        type
      )} pl-4 py-3 my-3 rounded-r-md ${className}`}
    >
      <div
        className={`text-xs font-medium mb-2 uppercase tracking-wide ${getLabelColor(
          type
        )}`}
      >
        {getBlockLabel(type)}
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </div>
  );
}

export function LyricsEditor({
  initialValue,
  onChange,
  placeholder = "Start writing your lyrics...",
  className = "",
}: LyricsEditorProps) {
  const [value, setValue] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Handle SSR
  useEffect(() => {
    setIsClient(true);
    if (initialValue && Array.isArray(initialValue)) {
      // Convert initial value to string for simple text editor
      const text = initialValue
        .map((block: unknown) => {
          if (
            typeof block === "object" &&
            block !== null &&
            "children" in block
          ) {
            const blockObj = block as { children: unknown[] };
            return blockObj.children
              .map((child: unknown) => {
                if (
                  typeof child === "object" &&
                  child !== null &&
                  "text" in child
                ) {
                  return (child as { text: string }).text || "";
                }
                return "";
              })
              .join("");
          }
          return "";
        })
        .join("\n\n");
      setValue(text);
    }
  }, [initialValue]);

  const handleChange = (newValue: string) => {
    setValue(newValue);

    // Convert back to Plate.js format for onChange callback
    if (onChange) {
      const lines = newValue.split("\n\n").filter((line) => line.trim());
      const plateContent = lines.map((line) => ({
        type: "p",
        children: [{ text: line }],
      }));

      if (plateContent.length === 0) {
        plateContent.push({
          type: "p",
          children: [{ text: "" }],
        });
      }

      onChange(plateContent);
    }
  };

  // Don't render on server side to avoid hydration issues
  if (!isClient) {
    return (
      <div className={`lyrics-editor ${className}`}>
        <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`lyrics-editor ${className}`}>
      <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full min-h-[350px] outline-none resize-none text-gray-900 leading-relaxed"
          style={{ fontFamily: "inherit" }}
        />
      </div>
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
            console.log("Insert verse");
          }}
        >
          📝 Verse
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          onClick={() => {
            console.log("Insert chorus");
          }}
        >
          🎵 Chorus
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          onClick={() => {
            console.log("Insert bridge");
          }}
        >
          🌉 Bridge
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          onClick={() => {
            console.log("Insert pre-chorus");
          }}
        >
          ⚡ Pre-Chorus
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => {
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
            console.log("Bold");
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => {
            console.log("Italic");
          }}
        >
          <em>I</em>
        </button>
      </div>
    </div>
  );
}
