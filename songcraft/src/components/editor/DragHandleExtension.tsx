/**
 * Drag Handle Extension for Tiptap
 *
 * Adds drag-and-drop functionality with improved event handling
 * to avoid ProseMirror event blocking.
 */

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface DragHandleOptions {
  /**
   * Whether to show drag handles
   */
  showHandles?: boolean;

  /**
   * Debug mode - makes handles always visible
   */
  debug?: boolean;
}

export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: "dragHandle",

  addOptions() {
    return {
      showHandles: true,
      debug: false,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          "data-drag-handle": {
            default: null,
            parseHTML: () => "true",
            renderHTML: () => ({ "data-drag-handle": "true" }),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("dragHandle"),
        props: {
          decorations: (state) => {
            if (!this.options.showHandles) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const { doc } = state;

            doc.descendants((node: ProseMirrorNode, pos: number) => {
              // Add handle to paragraphs and headings
              if (
                node.type.name === "paragraph" ||
                node.type.name === "heading"
              ) {
                const decoration = Decoration.widget(
                  pos,
                  () => {
                    console.log(
                      "🔧 Creating drag handle widget for position:",
                      pos
                    );

                    const handle = document.createElement("div");
                    handle.className = "drag-handle-widget";
                    handle.innerHTML = "⋮⋮";
                    handle.setAttribute("data-drag-handle", "true");
                    handle.setAttribute("data-position", pos.toString());
                    handle.setAttribute("draggable", "true");

                    // Add debug class if debug mode is enabled
                    if (this.options.debug) {
                      handle.classList.add("debug");
                    }

                    handle.style.cssText = `
                      position: absolute;
                      left: -30px;
                      top: 50%;
                      transform: translateY(-50%);
                      cursor: grab;
                      color: #9ca3af;
                      font-size: 14px;
                      line-height: 1;
                      user-select: none;
                      opacity: ${this.options.debug ? "1" : "0"};
                      transition: opacity 0.2s;
                      z-index: 10;
                      padding: 4px;
                      background: rgba(255, 255, 255, 0.8);
                      border-radius: 2px;
                    `;

                    // Add comprehensive event logging
                    const logEvent = (eventName: string, event: Event) => {
                      console.log(`🎯 ${eventName}`, {
                        target: event.target,
                        currentTarget: event.currentTarget,
                        position: pos,
                        nodeType: node.type.name,
                        timestamp: Date.now(),
                        event: event,
                      });
                    };

                    // Mouse events with stopPropagation
                    handle.addEventListener(
                      "mouseenter",
                      (e) => {
                        logEvent("Handle mouseenter", e);
                        e.stopPropagation();
                        handle.style.opacity = "1";
                        handle.style.color = "#6b7280";
                      },
                      true
                    );

                    handle.addEventListener(
                      "mouseleave",
                      (e) => {
                        logEvent("Handle mouseleave", e);
                        e.stopPropagation();
                        handle.style.opacity = "0";
                        handle.style.color = "#9ca3af";
                      },
                      true
                    );

                    // Drag events with stopPropagation
                    handle.addEventListener(
                      "dragstart",
                      (e) => {
                        logEvent("Handle dragstart", e);
                        e.stopPropagation();

                        // Set drag data
                        e.dataTransfer?.setData("text/plain", pos.toString());
                        e.dataTransfer?.setData(
                          "application/x-prosemirror-node",
                          node.type.name
                        );
                        e.dataTransfer?.setData(
                          "text/html",
                          node.textContent || ""
                        );

                        // Visual feedback
                        handle.style.cursor = "grabbing";
                        handle.style.opacity = "1";
                        handle.style.color = "#374151";
                      },
                      true
                    );

                    handle.addEventListener(
                      "dragend",
                      (e) => {
                        logEvent("Handle dragend", e);
                        e.stopPropagation();

                        // Reset visual feedback
                        handle.style.cursor = "grab";
                        handle.style.opacity = "0";
                        handle.style.color = "#9ca3af";
                      },
                      true
                    );

                    // Click events to test if events are working
                    handle.addEventListener(
                      "click",
                      (e) => {
                        logEvent("Handle click", e);
                        e.stopPropagation();
                        e.preventDefault();
                        console.log(
                          "✅ Handle click successful - events are working!"
                        );
                      },
                      true
                    );

                    // Add a timeout to log when the handle is created
                    setTimeout(() => {
                      console.log("⏰ Handle created and ready:", {
                        position: pos,
                        nodeType: node.type.name,
                        element: handle,
                        parent: handle.parentElement,
                      });
                    }, 100);

                    return handle;
                  },
                  {
                    side: -1,
                    marks: [],
                  }
                );
                decorations.push(decoration);
              }
            });

            console.log(
              "🎨 Created",
              decorations.length,
              "drag handle decorations"
            );
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
