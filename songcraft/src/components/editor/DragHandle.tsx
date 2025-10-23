/**
 * DragHandle Component
 *
 * Uses the official Tiptap Drag Handle React extension for reliable
 * drag-and-drop functionality.
 */

import { DragHandle as DragHandleReact } from "@tiptap/extension-drag-handle-react";
import { cn } from "../../lib/utils";

export interface DragHandleProps {
  /**
   * Tiptap editor instance
   */
  editor: any;

  /**
   * Whether to show the drag handle
   */
  show?: boolean;

  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Callback when dragging starts
   */
  onDragStart?: (e: DragEvent) => void;

  /**
   * Callback when dragging ends
   */
  onDragEnd?: (e: DragEvent) => void;

  /**
   * Callback when node changes (hover)
   */
  onNodeChange?: (params: {
    node: unknown;
    editor: unknown;
    pos: number;
  }) => void;
}

export function DragHandle({
  editor,
  show = true,
  className,
  onDragStart,
  onDragEnd,
  onNodeChange,
}: DragHandleProps) {
  if (!show) return null;

  return (
    <DragHandleReact
      editor={editor}
      computePositionConfig={{
        placement: "left-start",
        strategy: "absolute",
      }}
      onElementDragStart={(_e) => {
        console.log("🚀 Official DragHandle: Drag start", _e);
        onDragStart?.(_e);
      }}
      onElementDragEnd={(_e) => {
        console.log("🏁 Official DragHandle: Drag end", _e);
        onDragEnd?.(_e);
      }}
      onNodeChange={(params) => {
        console.log("🎯 Official DragHandle: Node change", params);
        onNodeChange?.(params);
      }}
    >
      <div
        className={cn(
          "drag-handle-official",
          "flex items-center justify-center",
          "w-6 h-6 rounded",
          "bg-white border border-gray-300",
          "cursor-grab hover:bg-gray-50",
          "text-gray-500 hover:text-gray-700",
          "transition-colors duration-200",
          "shadow-sm hover:shadow-md",
          className
        )}
        title="Drag to reorder lines"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="opacity-60"
          aria-label="Drag handle"
        >
          <title>Drag handle</title>
          <circle cx="2" cy="2" r="1" />
          <circle cx="6" cy="2" r="1" />
          <circle cx="10" cy="2" r="1" />
          <circle cx="2" cy="6" r="1" />
          <circle cx="6" cy="6" r="1" />
          <circle cx="10" cy="6" r="1" />
          <circle cx="2" cy="10" r="1" />
          <circle cx="6" cy="10" r="1" />
          <circle cx="10" cy="10" r="1" />
        </svg>
      </div>
    </DragHandleReact>
  );
}
