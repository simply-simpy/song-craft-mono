/**
 * PlateToolbar Component
 *
 * A toolbar for the Plate.js editor with basic formatting options
 * integrated with the SongCraft design system.
 */

import { Toolbar, ToolbarButton } from "@udecode/plate-ui";
import React from "react";
import "./editor.css";
import {
	BoldPlugin,
	CodePlugin,
	ItalicPlugin,
	StrikethroughPlugin,
	UnderlinePlugin,
} from "@udecode/plate-basic-marks";
import {
	Heading1Plugin,
	Heading2Plugin,
	Heading3Plugin,
} from "@udecode/plate-heading";
import { LinkPlugin } from "@udecode/plate-link";
import { BulletedListPlugin, NumberedListPlugin } from "@udecode/plate-list";
import { cn } from "../../lib/utils";

// Import icons (you can replace these with your preferred icon library)
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link,
	List,
	ListOrdered,
	Strikethrough,
	Underline,
} from "lucide-react";

export function PlateToolbar() {
	return (
		<Toolbar
			className={cn(
				"plate-toolbar",
				"flex items-center gap-1 p-2 border-b border-gray-200 rounded-t-md",
				"bg-surface-elevated",
				"dark:border-border-secondary dark:bg-surface-base",
			)}
		>
			{/* Text Formatting */}
			<div className="flex items-center gap-1">
				<ToolbarButton
					pluginKey={BoldPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Bold"
				>
					<Bold className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={ItalicPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Italic"
				>
					<Italic className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={UnderlinePlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Underline"
				>
					<Underline className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={StrikethroughPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Strikethrough"
				>
					<Strikethrough className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={CodePlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Code"
				>
					<Code className="h-4 w-4" />
				</ToolbarButton>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Headings */}
			<div className="flex items-center gap-1">
				<ToolbarButton
					pluginKey={Heading1Plugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Heading 1"
				>
					<Heading1 className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={Heading2Plugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Heading 2"
				>
					<Heading2 className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={Heading3Plugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Heading 3"
				>
					<Heading3 className="h-4 w-4" />
				</ToolbarButton>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Lists */}
			<div className="flex items-center gap-1">
				<ToolbarButton
					pluginKey={BulletedListPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Bulleted List"
				>
					<List className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					pluginKey={NumberedListPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Numbered List"
				>
					<ListOrdered className="h-4 w-4" />
				</ToolbarButton>
			</div>

			{/* Separator */}
			<div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

			{/* Links */}
			<div className="flex items-center gap-1">
				<ToolbarButton
					pluginKey={LinkPlugin.key}
					className={cn(
						"p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
						"transition-colors duration-200",
					)}
					aria-label="Link"
				>
					<Link className="h-4 w-4" />
				</ToolbarButton>
			</div>
		</Toolbar>
	);
}
