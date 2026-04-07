/**
 * File upload validation via magic bytes and content analysis.
 *
 * MIME types from form submissions are user-controlled and can be spoofed.
 * This module verifies actual file content by checking magic byte signatures
 * and scanning for dangerous embedded content (e.g., JavaScript in PDFs,
 * polyglot attacks in images).
 *
 * @module security/file-validation
 */

import { logSecurityEvent } from '@/lib/security/audit-log';


// Magic byte signatures for supported file types
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }> = {
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }, // %PDF
  jpeg: { bytes: [0xff, 0xd8, 0xff], offset: 0 },
  png: { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 }, // .PNG
};

/**
 * Validate that a file's actual content matches the expected type by
 * checking its magic bytes (file signature).
 *
 * @param file - The uploaded File object.
 * @param expectedType - One of 'pdf', 'jpeg', or 'png'.
 * @returns `true` if the file's magic bytes match the expected type.
 */
export async function validateFileMagicBytes(
  file: File,
  expectedType: 'pdf' | 'jpeg' | 'png',
): Promise<boolean> {
  const sig = MAGIC_BYTES[expectedType];
  if (!sig) return false;

  // Read just enough bytes to check the signature
  const bytesNeeded = sig.offset + sig.bytes.length;
  const slice = file.slice(0, bytesNeeded);
  const buffer = await slice.arrayBuffer();
  const view = new Uint8Array(buffer);

  if (view.length < bytesNeeded) return false;

  return sig.bytes.every((byte, i) => view[sig.offset + i] === byte);
}

// ---------------------------------------------------------------------------
// Dangerous PDF patterns
// ---------------------------------------------------------------------------

// These patterns indicate embedded code, auto-actions, or external calls
// that are common in malicious PDFs used for phishing or code execution.
const DANGEROUS_PDF_PATTERNS = [
  /\/JavaScript\b/i,    // Embedded JavaScript
  /\/JS\b/,             // JavaScript action shorthand
  /\/Launch\b/,         // Launch external application
  /\/SubmitForm\b/,     // Auto-submit form data to external URL
  /\/ImportData\b/,     // Import external data
  /\/RichMedia\b/,      // Embedded Flash/multimedia
  /\/XFA\b/,            // XFA forms (attack vector)
  /\/AA\b/,             // Additional Actions (auto-execute triggers)
  /\/OpenAction\b/,     // Action on document open
  /\/EmbeddedFile\b/,   // Embedded file (polyglot/dropper)
];

/**
 * Scan a PDF file for dangerous embedded content.
 *
 * Reads the file as text and checks for patterns that indicate
 * embedded JavaScript, auto-execution actions, or external calls.
 * These are the most common attack vectors in malicious PDF uploads.
 *
 * @param file - The uploaded PDF File object.
 * @returns Object with `safe` boolean and optional `reason` string.
 */
export async function scanPdfContent(
  file: File,
): Promise<{ safe: boolean; reason?: string }> {
  // Read raw bytes and convert to a latin1 string for pattern matching.
  // PDF internals are ASCII-based, so latin1 preserves all byte values.
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Convert to string in 64KB chunks to avoid call-stack limits on large files
  const chunks: string[] = [];
  const CHUNK_SIZE = 65536;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(
      String.fromCharCode(...bytes.slice(i, i + CHUNK_SIZE)),
    );
  }
  const content = chunks.join('');

  for (const pattern of DANGEROUS_PDF_PATTERNS) {
    if (pattern.test(content)) {
      logSecurityEvent('security.file_blocked', {
        action: 'pdf_upload',
        reason: `Blocked pattern: ${pattern.source}`,
        fileName: file.name,
        fileSize: file.size,
      }).catch(() => {});
      return {
        safe: false,
        reason: `PDF contains blocked content: ${pattern.source}`,
      };
    }
  }

  return { safe: true };
}

// ---------------------------------------------------------------------------
// Image content validation
// ---------------------------------------------------------------------------

// Patterns that should never appear inside legitimate image binary data.
// Their presence indicates a polyglot file (image + HTML/script hybrid).
const DANGEROUS_IMAGE_PATTERNS = [
  /<script[\s>]/i,      // Embedded HTML script tag
  /<iframe[\s>]/i,      // Embedded iframe
  /<%\s/,               // Server-side template injection (ASP/JSP)
  /<\?php/i,            // Embedded PHP
];

/**
 * Scan an image file for polyglot attacks.
 *
 * Checks for HTML/script content embedded in image binary data.
 * Polyglot files can be served as HTML by misconfigured servers,
 * executing the embedded script in a browser context.
 *
 * @param file - The uploaded image File object (PNG or JPEG).
 * @returns Object with `safe` boolean and optional `reason` string.
 */
export async function scanImageContent(
  file: File,
): Promise<{ safe: boolean; reason?: string }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Only scan the first 64KB — polyglot payloads must appear early
  // to be effective, and this avoids reading multi-MB images fully.
  const scanLength = Math.min(bytes.length, 65536);
  const content = String.fromCharCode(...bytes.slice(0, scanLength));

  for (const pattern of DANGEROUS_IMAGE_PATTERNS) {
    if (pattern.test(content)) {
      logSecurityEvent('security.file_blocked', {
        action: 'image_upload',
        reason: `Blocked pattern: ${pattern.source}`,
        fileName: file.name,
        fileSize: file.size,
      }).catch(() => {});
      return {
        safe: false,
        reason: `Image contains suspicious embedded content: ${pattern.source}`,
      };
    }
  }

  return { safe: true };
}
