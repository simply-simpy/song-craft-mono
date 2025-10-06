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

// Re-export Zod for use across workspaces
export { z, ZodError } from "zod";

// =======================
// Base Schema Components
// =======================

// Common field schemas for reuse
export const uuidSchema = z.string().uuid("Invalid UUID format");
export const shortIdSchema = z
  .string()
  .length(16, "Short ID must be exactly 16 characters")
  .regex(/^[a-f0-9]{16}$/, "Short ID must be 16 lowercase hex characters");

export const emailSchema = z.string().email("Invalid email format");
export const nonEmptyStringSchema = z.string().min(1, "Field cannot be empty");
export const optionalStringSchema = z.string().optional();
export const nullableStringSchema = z.string().nullable();

// Date schemas
export const isoDateStringSchema = z
  .string()
  .datetime("Invalid ISO date format");
export const dateSchema = z.date();

// Pagination schemas
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative(),
});

// Error response schema (shared across all routes)
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(), // More type-safe than z.any()
});

// =======================
// Entity Schemas
// =======================

export const songSchema = z.object({
  id: uuidSchema,
  title: nonEmptyStringSchema,
  artist: optionalStringSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
  lyrics: optionalStringSchema,
  midiData: optionalStringSchema,
  collaborators: z.array(z.string()).optional(),
});

export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: optionalStringSchema,
  avatar: optionalStringSchema,
});

// =======================
// API Response Schemas
// =======================

export const songResponseSchema = z.object({
  id: uuidSchema,
  shortId: shortIdSchema,
  ownerClerkId: z.string(),
  title: z.string(),
  artist: nullableStringSchema,
  bpm: z.number().nullable(),
  key: nullableStringSchema,
  tags: z.array(z.string()),
  lyrics: nullableStringSchema,
  midiData: nullableStringSchema,
  collaborators: z.array(z.string()),
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
});

export const songsListResponseSchema = z.object({
  songs: z.array(songResponseSchema),
  pagination: paginationMetaSchema,
});

// =======================
// Type Exports
// =======================

export type Song = z.infer<typeof songSchema>;
export type User = z.infer<typeof userSchema>;
export type SongResponse = z.infer<typeof songResponseSchema>;
export type SongsListResponse = z.infer<typeof songsListResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

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
