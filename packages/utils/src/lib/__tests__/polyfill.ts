import _crypto from 'node:crypto';

// eslint-disable-next-line
globalThis.crypto = _crypto.webcrypto as any;
