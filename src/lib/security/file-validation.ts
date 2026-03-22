/**
 * File upload validation via magic bytes.
 *
 * MIME types from form submissions are user-controlled and can be spoofed.
 * This module verifies actual file content by checking magic byte signatures.
 *
 * @module security/file-validation
 */

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
