/**
 * RichTextToolbar Component
 *
 * A toolbar for the Tiptap editor with basic formatting options
 * integrated with the SongCraft design system.
 */

import type { Editor } from "@tiptap/react";
import React from "react";
import { cn } from "../../lib/utils";
import "./editor.css";

// Import icons
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo,
	Strikethrough,
	Underline,
	Undo,
} from "lucide-react";

interface RichTextToolbarProps {
	editor: Editor;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
	if (!editor) return null;

	return (
		<div
			className={cn(
				"rich-text-toolbar",
				"flex items-center gap-1 p-2 border-b border-gray-200 rounded-t-md",
				"bg-surface-elevated",
				"dark:border-border-secondary dark:bg-surface-base",
			)}
		>
			{/* Undo/Redo */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
					)}
					aria-label="Undo"
				>
					<Undo className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
					)}
					aria-label="Redo"
				>
					<Redo className="h-4 w-4" />
				</button>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Text Formatting */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("bold") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Bold"
				>
					<Bold className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("italic") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Italic"
				>
					<Italic className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("strike") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Strikethrough"
				>
					<Strikethrough className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("code") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Code"
				>
					<Code className="h-4 w-4" />
				</button>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Headings */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("heading", { level: 1 }) &&
							"bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Heading 1"
				>
					<Heading1 className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("heading", { level: 2 }) &&
							"bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Heading 2"
				>
					<Heading2 className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("heading", { level: 3 }) &&
							"bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Heading 3"
				>
					<Heading3 className="h-4 w-4" />
				</button>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Lists */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("bulletList") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Bulleted List"
				>
					<List className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("orderedList") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Numbered List"
				>
					<ListOrdered className="h-4 w-4" />
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
						editor.isActive("blockquote") && "bg-gray-200 dark:bg-gray-600",
					)}
					aria-label="Block Quote"
				>
					<Quote className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
