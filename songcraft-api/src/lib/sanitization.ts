import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a JSDOM window for DOMPurify in Node.js environment
const jsdomWindow = new JSDOM("").window as unknown as Window &
  typeof globalThis;
const purify = createDOMPurify(jsdomWindow);

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li"],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes plain text by escaping HTML characters
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes user input for database storage
 * Removes potentially dangerous characters and normalizes whitespace
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 10000); // Limit length to prevent DoS
}

/**
 * Sanitizes song lyrics specifically
 * Allows basic formatting but removes dangerous content
 */
export function sanitizeLyrics(lyrics: string): string {
  if (typeof lyrics !== "string") {
    return "";
  }

  // First sanitize as HTML to allow basic formatting
  const sanitizedHtml = sanitizeHtml(lyrics);

  // Then apply additional text sanitization
  return sanitizeInput(sanitizedHtml);
}

/**
 * Sanitizes song title
 * More restrictive than lyrics - only allows plain text
 */
export function sanitizeTitle(title: string): string {
  if (typeof title !== "string") {
    return "";
  }

  return sanitizeText(sanitizeInput(title));
}

/**
 * Sanitizes description text
 * Allows basic HTML formatting but removes dangerous content
 */
export function sanitizeDescription(description: string): string {
  if (typeof description !== "string") {
    return "";
  }

  return sanitizeHtml(sanitizeInput(description));
}
