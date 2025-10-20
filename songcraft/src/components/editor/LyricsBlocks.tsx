import React from "react";
import { PlateElement, PlateElementProps } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-common";

// Custom block types for song lyrics
export const ELEMENT_VERSE = "verse";
export const ELEMENT_CHORUS = "chorus";
export const ELEMENT_BRIDGE = "bridge";
export const ELEMENT_PRE_CHORUS = "pre_chorus";
export const ELEMENT_OUTRO = "outro";

// Verse Element Component
export function VerseElement({ children, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="lyrics-verse bg-blue-50 border-l-4 border-blue-400 pl-4 py-3 my-3 rounded-r-md"
    >
      <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
        Verse
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </PlateElement>
  );
}

// Chorus Element Component
export function ChorusElement({ children, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="lyrics-chorus bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-3 my-3 rounded-r-md"
    >
      <div className="text-xs text-yellow-600 font-medium mb-2 uppercase tracking-wide">
        Chorus
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </PlateElement>
  );
}

// Bridge Element Component
export function BridgeElement({ children, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="lyrics-bridge bg-purple-50 border-l-4 border-purple-400 pl-4 py-3 my-3 rounded-r-md"
    >
      <div className="text-xs text-purple-600 font-medium mb-2 uppercase tracking-wide">
        Bridge
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </PlateElement>
  );
}

// Pre-Chorus Element Component
export function PreChorusElement({ children, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="lyrics-pre-chorus bg-green-50 border-l-4 border-green-400 pl-4 py-3 my-3 rounded-r-md"
    >
      <div className="text-xs text-green-600 font-medium mb-2 uppercase tracking-wide">
        Pre-Chorus
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </PlateElement>
  );
}

// Outro Element Component
export function OutroElement({ children, ...props }: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="lyrics-outro bg-gray-50 border-l-4 border-gray-400 pl-4 py-3 my-3 rounded-r-md"
    >
      <div className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
        Outro
      </div>
      <div className="prose prose-sm max-w-none">{children}</div>
    </PlateElement>
  );
}

// Custom plugins
export const createVersePlugin = () =>
  createPlatePlugin({
    key: ELEMENT_VERSE,
    isElement: true,
    component: VerseElement,
  });

export const createChorusPlugin = () =>
  createPlatePlugin({
    key: ELEMENT_CHORUS,
    isElement: true,
    component: ChorusElement,
  });

export const createBridgePlugin = () =>
  createPlatePlugin({
    key: ELEMENT_BRIDGE,
    isElement: true,
    component: BridgeElement,
  });

export const createPreChorusPlugin = () =>
  createPlatePlugin({
    key: ELEMENT_PRE_CHORUS,
    isElement: true,
    component: PreChorusElement,
  });

export const createOutroPlugin = () =>
  createPlatePlugin({
    key: ELEMENT_OUTRO,
    isElement: true,
    component: OutroElement,
  });
