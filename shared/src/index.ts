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

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
