const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function stringToArrayBuffer(str: string): ArrayBuffer {
  return encoder.encode(str).buffer;
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  return decoder.decode(buffer);
}

export function hexStringToArrayBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }

  const byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
    byteArray[j] = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byteArray[j])) {
      throw new Error('Invalid hex string');
    }
  }
  return byteArray.buffer;
}

export function arrayBufferToHexString(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function concatenateArrayBuffers(...buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result.buffer;
}
