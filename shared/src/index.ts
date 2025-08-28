// Common types used across the application
export interface Song {
  id: string;
  title: string;
  artist?: string;
  createdAt: Date;
  updatedAt: Date;
  lyrics?: string;
  midiData?: string;
  collaborators?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Collaboration {
  id: string;
  songId: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
}

// Common validation schemas
import { z } from "zod";

export const songSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  artist: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lyrics: z.string().optional(),
  midiData: z.string().optional(),
  collaborators: z.array(z.string()).optional(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

// Common utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Short ID generation utilities using nanoid
import { nanoid } from "nanoid";

export const generateShortId = (): string => {
  // Generate a 6-character ID using nanoid
  return nanoid(6);
};

export const generateHumanReadableId = (prefix: string): string => {
  const shortId = generateShortId();
  return `${prefix}-${shortId}`;
};

// Specific ID generators for different entity types
export const generateSongId = (): string => generateHumanReadableId("song");
export const generateUserId = (): string => generateHumanReadableId("user");
export const generateCollaborationId = (): string =>
  generateHumanReadableId("collab");

// ID validation and parsing utilities
export const isValidHumanReadableId = (id: string): boolean => {
  const pattern = /^[a-z]+-[A-Za-z0-9]{6}$/;
  return pattern.test(id);
};

export const parseHumanReadableId = (
  id: string
): { prefix: string; shortId: string } | null => {
  if (!isValidHumanReadableId(id)) {
    return null;
  }
  const [prefix, shortId] = id.split("-");
  return { prefix, shortId };
};

export const extractPrefix = (id: string): string | null => {
  const parsed = parseHumanReadableId(id);
  return parsed?.prefix || null;
};

// Legacy function for backward compatibility
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
