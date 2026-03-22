/**
 * HTML sanitization and search input sanitization utilities.
 *
 * - `sanitizeHtml` strips dangerous tags/attributes from rich-text HTML
 *   (e.g., TipTap output) before rendering as inner HTML.
 * - `sanitizeSearchInput` removes PostgREST filter-syntax characters to
 *   prevent filter injection in `.or()` calls.
 *
 * @module security/sanitize
 */

import DOMPurify from 'isomorphic-dompurify';

// ---------------------------------------------------------------------------
// HTML sanitization (for rich-text output like TipTap job descriptions)
// ---------------------------------------------------------------------------

/** Tags that TipTap's StarterKit can produce. */
const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'i',
  'a',
  'br',
  'blockquote',
  'code',
  'pre',
  'hr',
  'span',
];

/** Attributes safe for the allowed tags. */
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

// Force all anchor tags to have rel="noopener noreferrer" for safety
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer');
    // Only allow http(s) links
    const href = node.getAttribute('href') ?? '';
    if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/')) {
      node.removeAttribute('href');
    }
  }
});

/**
 * Sanitize HTML content for safe rendering.
 * Strips all tags and attributes not in the TipTap allowlist.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

// ---------------------------------------------------------------------------
// PostgREST search input sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize user input before interpolating into PostgREST `.or()` filter strings.
 *
 * Removes characters that have special meaning in PostgREST filter syntax
 * (commas separate filters, dots separate field.operator.value, parentheses
 * group expressions). Also limits length to prevent oversized queries.
 */
export function sanitizeSearchInput(input: string, maxLength = 100): string {
  return input
    .replace(/[,.()"'\\]/g, '') // Strip PostgREST special chars
    .trim()
    .slice(0, maxLength);
}
