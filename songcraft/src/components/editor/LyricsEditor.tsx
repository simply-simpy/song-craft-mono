/**
 * LyricsEditor Component
 *
 * A specialized rich text editor for song lyrics with drag-and-drop functionality
 * similar to Notion's block-based editing system.
 */

import React, { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "../../lib/utils";
import "./lyrics-editor.css";

export interface LyricsEditorProps {
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
	 * Whether to show drag handles
	 */
	showDragHandles?: boolean;
}

interface LyricBlock {
	id: string;
	type: "verse" | "chorus" | "bridge" | "pre-chorus" | "outro" | "text";
	content: string;
	order: number;
}

export function LyricsEditor({
	value = "",
	onChange,
	placeholder = "Start writing your lyrics...",
	readOnly = false,
	className,
	showDragHandles = true,
}: LyricsEditorProps) {
	const [blocks, setBlocks] = useState<LyricBlock[]>([]);
	const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
	const editorRef = useRef<HTMLDivElement>(null);

	// Parse initial value into blocks
	React.useEffect(() => {
		if (value) {
			const parsedBlocks = parseLyricsToBlocks(value);
			setBlocks(parsedBlocks);
		}
	}, [value]);

	// Convert blocks back to HTML when they change
	React.useEffect(() => {
		const html = convertBlocksToHtml(blocks);
		onChange?.(html);
	}, [blocks, onChange]);

	const parseLyricsToBlocks = (html: string): LyricBlock[] => {
		// Simple parsing - in a real implementation, you'd want more sophisticated parsing
		const lines = html.split('\n').filter(line => line.trim());
		return lines.map((line, index) => ({
			id: `block-${Date.now()}-${index}`,
			type: detectBlockType(line),
			content: line.trim(),
			order: index,
		}));
	};

	const detectBlockType = (content: string): LyricBlock['type'] => {
		const lowerContent = content.toLowerCase();
		if (lowerContent.includes('[verse]') || lowerContent.includes('verse:')) return 'verse';
		if (lowerContent.includes('[chorus]') || lowerContent.includes('chorus:')) return 'chorus';
		if (lowerContent.includes('[bridge]') || lowerContent.includes('bridge:')) return 'bridge';
		if (lowerContent.includes('[pre-chorus]') || lowerContent.includes('pre-chorus:')) return 'pre-chorus';
		if (lowerContent.includes('[outro]') || lowerContent.includes('outro:')) return 'outro';
		return 'text';
	};

	const convertBlocksToHtml = (blocks: LyricBlock[]): string => {
		return blocks
			.sort((a, b) => a.order - b.order)
			.map(block => block.content)
			.join('\n');
	};

	const addBlock = useCallback((type: LyricBlock['type'] = 'text', afterIndex?: number) => {
		const newBlock: LyricBlock = {
			id: `block-${Date.now()}-${Math.random()}`,
			type,
			content: '',
			order: afterIndex !== undefined ? afterIndex + 1 : blocks.length,
		};

		setBlocks(prevBlocks => {
			const updatedBlocks = [...prevBlocks];
			if (afterIndex !== undefined) {
				// Insert after the specified index
				updatedBlocks.splice(afterIndex + 1, 0, newBlock);
				// Reorder all blocks
				return updatedBlocks.map((block, index) => ({ ...block, order: index }));
			}
			return [...updatedBlocks, newBlock];
		});
	}, [blocks.length]);

	const updateBlock = useCallback((id: string, content: string) => {
		setBlocks(prevBlocks =>
			prevBlocks.map(block =>
				block.id === id ? { ...block, content } : block
			)
		);
	}, []);

	const deleteBlock = useCallback((id: string) => {
		setBlocks(prevBlocks => {
			const filtered = prevBlocks.filter(block => block.id !== id);
			// Reorder remaining blocks
			return filtered.map((block, index) => ({ ...block, order: index }));
		});
	}, []);

	const moveBlock = useCallback((dragId: string, dropId: string) => {
		setBlocks(prevBlocks => {
			const dragIndex = prevBlocks.findIndex(block => block.id === dragId);
			const dropIndex = prevBlocks.findIndex(block => block.id === dropId);

			if (dragIndex === -1 || dropIndex === -1) return prevBlocks;

			const newBlocks = [...prevBlocks];
			const [draggedBlock] = newBlocks.splice(dragIndex, 1);
			newBlocks.splice(dropIndex, 0, draggedBlock);

			// Reorder all blocks
			return newBlocks.map((block, index) => ({ ...block, order: index }));
		});
	}, []);

	const handleDragStart = (e: React.DragEvent, blockId: string) => {
		setDraggedBlock(blockId);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', blockId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = (e: React.DragEvent, dropBlockId: string) => {
		e.preventDefault();
		const dragBlockId = e.dataTransfer.getData('text/html');
		
		if (dragBlockId && dragBlockId !== dropBlockId) {
			moveBlock(dragBlockId, dropBlockId);
		}
		setDraggedBlock(null);
	};

	const handleDragEnd = () => {
		setDraggedBlock(null);
	};

	const getBlockIcon = (type: LyricBlock['type']) => {
		switch (type) {
			case 'verse': return '📝';
			case 'chorus': return '🎵';
			case 'bridge': return '🌉';
			case 'pre-chorus': return '🎶';
			case 'outro': return '🎤';
			default: return '📄';
		}
	};

	const getBlockClassName = (type: LyricBlock['type']) => {
		switch (type) {
			case 'verse': return 'song-section-verse';
			case 'chorus': return 'song-section-chorus';
			case 'bridge': return 'song-section-bridge';
			case 'pre-chorus': return 'song-section-pre-chorus';
			case 'outro': return 'song-section-outro';
			default: return 'song-section-text';
		}
	};

	return (
		<div className={cn("lyrics-editor-container", className)}>
			{blocks.length === 0 ? (
				<div className="lyrics-editor-empty">
					<p className="text-gray-500 mb-4">{placeholder}</p>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => addBlock('verse')}
							className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
						>
							📝 Add Verse
						</button>
						<button
							type="button"
							onClick={() => addBlock('chorus')}
							className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
						>
							🎵 Add Chorus
						</button>
						<button
							type="button"
							onClick={() => addBlock('bridge')}
							className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
						>
							🌉 Add Bridge
						</button>
					</div>
				</div>
			) : (
				<div className="lyrics-blocks">
					{blocks.map((block, index) => (
						<div
							key={block.id}
							className={cn(
								"lyrics-block",
								getBlockClassName(block.type),
								draggedBlock === block.id && "dragging"
							)}
							draggable={!readOnly && showDragHandles}
							onDragStart={(e) => handleDragStart(e, block.id)}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, block.id)}
							onDragEnd={handleDragEnd}
						>
							{showDragHandles && !readOnly && (
								<div className="lyrics-block-handle">
									<svg
										width="16"
										height="16"
										viewBox="0 0 16 16"
										fill="currentColor"
										className="text-gray-400"
										aria-label="Drag handle"
									>
										<title>Drag handle</title>
										<path d="M10 13a1 1 0 100-2 1 1 0 000 2zM10 5a1 1 0 100-2 1 1 0 000 2zM10 9a1 1 0 100-2 1 1 0 000 2zM6 13a1 1 0 100-2 1 1 0 000 2zM6 5a1 1 0 100-2 1 1 0 000 2zM6 9a1 1 0 100-2 1 1 0 000 2z" />
									</svg>
								</div>
							)}
							
							<div className="lyrics-block-content">
								<div className="lyrics-block-header">
									<span className="lyrics-block-icon">{getBlockIcon(block.type)}</span>
									<span className="lyrics-block-type">{block.type}</span>
									{!readOnly && (
										<div className="lyrics-block-actions">
											<button
												type="button"
												onClick={() => addBlock('verse', index)}
												className="lyrics-block-action"
												title="Add verse after"
											>
												📝
											</button>
											<button
												type="button"
												onClick={() => addBlock('chorus', index)}
												className="lyrics-block-action"
												title="Add chorus after"
											>
												🎵
											</button>
											<button
												type="button"
												onClick={() => deleteBlock(block.id)}
												className="lyrics-block-action text-red-500"
												title="Delete block"
											>
												🗑️
											</button>
										</div>
									)}
								</div>
								
								<textarea
									value={block.content}
									onChange={(e) => updateBlock(block.id, e.target.value)}
									placeholder={`Enter ${block.type} lyrics...`}
									className="lyrics-block-textarea"
									readOnly={readOnly}
									rows={Math.max(2, block.content.split('\n').length)}
								/>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
