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

import sanitize from 'sanitize-html';

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
const ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'class'],
  span: ['class'],
  '*': ['class'],
};

/**
 * Sanitize HTML content for safe rendering.
 * Strips all tags and attributes not in the TipTap allowlist.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          // Strip non-http(s) and non-relative hrefs
          ...(attribs.href &&
            !attribs.href.startsWith('http://') &&
            !attribs.href.startsWith('https://') &&
            !attribs.href.startsWith('/')
            ? { href: '' }
            : {}),
        },
      }),
    },
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
