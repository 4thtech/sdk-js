const webCrypto = globalThis.crypto;

export const subtle = webCrypto.subtle;

export async function calculateChecksum(data: ArrayBuffer): Promise<string> {
  const digest = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// This function cannot be directly translated for browsers since browsers don't have a concept of file paths.
export async function calculateChecksumFromStream(filePath: string): Promise<string> {
  console.error(`Cannot calculate checksum for the file at path: ${filePath}`);

  throw new Error('This function is only available in a Node.js environment.');
}

export async function createSha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const digest = await subtle.digest('SHA-256', encodedData);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getRandomValues(typedArray: Uint8Array) {
  return webCrypto.getRandomValues(typedArray);
}
