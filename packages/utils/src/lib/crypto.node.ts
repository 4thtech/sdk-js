import * as crypto from 'node:crypto';
import { createReadStream } from 'node:fs';

export const subtle = crypto.webcrypto?.subtle || {};

export async function calculateChecksum(data: ArrayBuffer): Promise<string> {
  const checksum = crypto.createHash('sha256').update(new Uint8Array(data)).digest('hex');

  // Wrap in a Promise to make it consistent with the browser version
  return Promise.resolve(checksum);
}

export async function calculateChecksumFromStream(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const readStream = createReadStream(filePath);

    readStream
      .on('data', (chunk) => {
        hash.update(chunk);
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('end', () => {
        resolve(hash.digest('hex'));
      });
  });
}

export function createSha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function getRandomValues(typedArray: Uint8Array) {
  return crypto.webcrypto.getRandomValues(typedArray);
}
