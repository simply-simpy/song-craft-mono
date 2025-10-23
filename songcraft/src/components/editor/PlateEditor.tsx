/**
 * RichTextEditor Component
 *
 * A reusable rich text editor component using Tiptap with integration
 * to the SongCraft design system and theme provider.
 */

import { type AnyExtension, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { cn } from "../../lib/utils";

// Import UI components
import { RichTextToolbar } from "./RichTextToolbar";
import { DragHandle } from "./DragHandle";

export interface RichTextEditorProps {
	/**
	 * Initial value for the editor (HTML string)
	 */
	value?: string;

	/**
	 * Callback when editor content changes
	 */
	onChange?: (value: string) => void;

	/**
	 * Placeholder text when editor is empty
	 */
	placeholder?: string;

	/**
	 * Whether the editor is read-only
	 */
	readOnly?: boolean;

	/**
	 * Additional CSS classes
	 */
	className?: string;

	/**
	 * Whether to show the toolbar
	 */
	showToolbar?: boolean;

	/**
	 * Custom extensions to include
	 */
	extensions?: AnyExtension[];

	/**
	 * Whether to show drag handles on each line
	 */
	showDragHandles?: boolean;
}

export function RichTextEditorComponent({
	value = "",
	onChange,
	placeholder = "Start writing...",
	readOnly = false,
	className,
	showToolbar = true,
	extensions: customExtensions = [],
	showDragHandles = false,
}: RichTextEditorProps) {
	// Create the editor with default extensions
	const editor = useEditor({
		extensions: [StarterKit, ...customExtensions],
		content: value,
		editable: !readOnly,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange?.(html);
		},
		editorProps: {
			attributes: {
				class: cn(
					"rich-text-editor",
					"min-h-[200px] p-4 border border-gray-300 rounded-md",
					"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
					"max-w-none",
					// Theme integration
					"bg-surface-base text-fg-primary",
					"border-border-primary focus:ring-brand-primary",
					"placeholder:text-fg-tertiary",
					// Dark mode support
					"dark:bg-surface-elevated dark:text-fg-primary",
					"dark:border-border-secondary dark:focus:ring-brand-primary",
				),
				"data-placeholder": placeholder,
			},
		},
	});

	// Update editor content when value prop changes
	React.useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [editor, value]);

	return (
		<div className={cn("rich-text-editor-container", className)}>
			{showToolbar && editor && <RichTextToolbar editor={editor} />}
			<div className="relative">
				<EditorContent editor={editor} />
				{showDragHandles && editor && (
					<DragHandle 
						editor={editor}
						show={showDragHandles}
						onDragStart={(e) => console.log("🚀 Drag started", e)}
						onDragEnd={(e) => console.log("🏁 Drag ended", e)}
						onNodeChange={(params) => console.log("🎯 Node changed", params)}
					/>
				)}
			</div>
		</div>
	);
}

// Export with a cleaner name
export { RichTextEditorComponent as RichTextEditor };
