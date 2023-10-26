import { describe, expect, it } from 'vitest';
import './polyfill';

import * as nodeCrypto from '../crypto.node';
import * as webCrypto from '../crypto.web';

describe('Crypto', () => {
  it('Should have the same checksum', async () => {
    const nodeChecksum = nodeCrypto.createSha256Hash('xyz');
    const webChecksum = await webCrypto.createSha256Hash('xyz');

    expect(nodeChecksum).to.be.equal(webChecksum);
  });
});
